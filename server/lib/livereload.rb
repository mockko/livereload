require 'em-websocket'
require 'em-dir-watcher'
require 'json/objects'
require 'stringio'

# Chrome sometimes sends HTTP/1.0 requests in violation of WebSockets spec
# hide the warning about redifinition of a constant
saved_stderr = $stderr
$stderr = StringIO.new
EventMachine::WebSocket::HandlerFactory::PATH = /^(\w+) (\/[^\s]*) HTTP\/1\.[01]$/
$stderr = saved_stderr

class Object
  def method_missing_with_livereload id, *args, &block
    if id == :config
      Object.send(:instance_variable_get, '@livereload_config')
    else
      method_missing_without_livereload id, *args, &block
    end
  end
end

module LiveReload
  GEM_VERSION = "1.5"
  API_VERSION = "1.5"

  PROJECT_CONFIG_FILE_TEMPLATE = <<-END.strip.split("\n").collect { |line| line.strip + "\n" }.join("")
  # Lines starting with pound sign (#) are ignored.

  # additional extensions to monitor
  #config.exts << 'haml'

  # exclude files with NAMES matching this mask
  #config.exclusions << '~*'
  # exclude files with PATHS matching this mask (if the mask contains a slash)
  #config.exclusions << '/excluded_dir/*'
  # exclude files with PATHS matching this REGEXP
  #config.exclusions << /somedir.*(ab){2,4}\.(css|js)$/

  # reload the whole page when .js changes
  #config.apply_js_live = false
  # reload the whole page when .css changes
  #config.apply_css_live = false
  # reload the whole page when images (png, jpg, gif) change
  #config.apply_images_live = false

  # wait 100ms for more changes before reloading a page
  #config.grace_period = 0.1
  END

  # note that host and port options do not make sense in per-project config files
  class Config
    attr_accessor :host, :port, :exts, :exts_overwrite, :exclusions, :debug, :apply_js_live, :apply_css_live, :apply_images_live, :grace_period

    def initialize &block
      @host           = nil
      @port           = nil
      @debug          = nil
      @exts           = []
      @exclusions     = []
      @apply_js_live  = nil
      @apply_css_live = nil
      @apply_images_live = nil
      @grace_period   = nil

      update!(&block) if block
    end

    def update!
      @exts = [nil] + @exts  # nil is used as a marker to detect if the array has been overwritten

      yield self

      @exts_overwrite = @exts.empty? || ! @exts.first.nil?
      @exts = @exts.compact

      # remove leading dots
      @exts = @exts.collect { |e| e.sub(/^\./, '') }
    end

    def merge! other
      @host           = other.host             if other.host
      @port           = other.port             if other.port
      if other.exts_overwrite
        @exts         = other.exts
      else
        @exts        += other.exts.compact
      end
      @exclusions     = other.exclusions + @exclusions
      @debug          = other.debug            if other.debug != nil
      @apply_js_live  = other.apply_js_live    if other.apply_js_live != nil
      @apply_css_live = other.apply_css_live   if other.apply_css_live != nil
      @apply_images_live = other.apply_images_live if other.apply_images_live != nil
      @grace_period   = other.grace_period     if other.grace_period != nil

      self
    end

    class << self
      def load_from file
        Config.new do |config|
          if File.file? file
            Object.send(:instance_variable_set, '@livereload_config', config)
            Object.send(:alias_method, :method_missing_without_livereload, :method_missing)
            Object.send(:alias_method, :method_missing, :method_missing_with_livereload)
            load file, true
            Object.send(:alias_method, :method_missing, :method_missing_without_livereload)
            Object.send(:instance_variable_set, '@livereload_config', nil)
          end
        end
      end

      def merge *configs
        configs.inject(Config.new) { |merged, config| config && merged.merge!(config) || merged }
      end
    end
  end

  DEFAULT_CONFIG = Config.new do |config|
    config.debug = false
    config.host  = '0.0.0.0'
    config.port  = 35729
    config.exts  = %w/html css js png gif jpg php php5 py rb erb/
    config.exclusions = %w!*/.git/* */.svn/* */.hg/*!
    config.apply_js_live  = false
    config.apply_css_live = true
    config.apply_images_live = true
    config.grace_period = 0.05
  end

  USER_CONFIG_FILE = File.expand_path("~/.livereload")
  USER_CONFIG = Config.load_from(USER_CONFIG_FILE)

  class Project
    attr_reader :config

    def initialize directory, explicit_config=nil
      @directory = directory
      @explicit_config = explicit_config
      read_config
    end

    def read_config
      project_config_file = File.join(@directory, '.livereload')
      unless File.file? project_config_file
        File.open(project_config_file, 'w') do |file|
          file.write PROJECT_CONFIG_FILE_TEMPLATE
        end
      end
      project_config = Config.load_from project_config_file
      @config = Config.merge(DEFAULT_CONFIG, USER_CONFIG, project_config, @explicit_config)
    end

    def print_config
      puts "Watching: #{@directory}"
      puts "  - extensions: " + @config.exts.collect {|e| ".#{e}"}.join(" ")
      if !@config.apply_js_live && !@config.apply_css_live
        puts "  - live refreshing disabled for .css & .js: will reload the whole page on every change"
      elsif !@config.apply_js_live
        puts "  - live refreshing disabled for .js: will reload the whole page when .js is changed"
      elsif !@config.apply_css_live
        puts "  - live refreshing disabled for .css: will reload the whole page when .css is changed"
      end
      if @config.exclusions.size > 0
        puts "  - excluding changes in: " + @config.exclusions.join(" ")
      end
      if @config.grace_period > 0
        puts "  - with a grace period of #{sprintf('%0.2f', @config.grace_period)} sec after each change"
      end
    end

    def when_changes_detected &block
      @when_changes_detected = block
    end

    def restart_watching
      if @dw
        @dw.stop
      end
      @dw = EMDirWatcher.watch @directory,
            :include_only => (['/.livereload'] + @config.exts.collect { |ext| ["*.#{ext}", ".*.#{ext}"]}).flatten,
            :exclude => @config.exclusions,
            :grace_period => @config.grace_period do |paths|
        begin
          paths.each do |path|
            if File.basename(path) == '.livereload'
              @when_changes_detected.call [:config_changed, path]
            else
              @when_changes_detected.call [:modified, File.join(@directory, path)]
            end
          end
        rescue
          puts $!
          puts $!.backtrace
        end
      end
    end
  end

  def self.configure
    yield Config
  end

  def self.run(directories, explicit_config)
    # EventMachine needs to run kqueue for the watching API to work
    EM.kqueue = true if EM.kqueue?

    web_sockets = []

    # for host and port
    global_config = Config.merge(DEFAULT_CONFIG, USER_CONFIG, explicit_config)
    directories = directories.collect { |directory| File.expand_path(directory) }
    projects = directories.collect { |directory| Project.new(directory, explicit_config) }

    puts
    puts "Version:  #{GEM_VERSION}  (compatible with browser extension versions #{API_VERSION}.x)"
    puts "Port:     #{global_config.port}"
    projects.each { |project| project.print_config }

    EventMachine.run do
      projects.each do |project|
        project.when_changes_detected do |event, modified_file|
          case event
          when :config_changed
            puts
            puts ">> Configuration change: " + modified_file
            puts
            EventMachine.next_tick do
              projects.each { |project| project.read_config; project.print_config }
              puts
              projects.each { |project| project.restart_watching }
            end
          when :excluded
            puts "Excluded: #{File.basename(modified_file)}"
          when :modified
            puts "Modified: #{File.basename(modified_file)}"
            data = ['refresh', { :path => modified_file,
                :apply_js_live  => project.config.apply_js_live,
                :apply_css_live => project.config.apply_css_live,
                :apply_images_live => project.config.apply_images_live }].to_json
            puts data if global_config.debug
            web_sockets.each do |ws|
              ws.send data
            end
          end
        end
      end

      projects.each { |project| project.restart_watching }

      puts
      puts "LiveReload is waiting for browser to connect."
      EventMachine::WebSocket.start(:host => global_config.host, :port => global_config.port, :debug => global_config.debug) do |ws|
        ws.onopen do
          begin
            puts "Browser connected."; ws.send "!!ver:#{API_VERSION}"; web_sockets << ws
          rescue
            puts $!
            puts $!.backtrace
          end
        end
        ws.onmessage do |msg|
          puts "Browser URL: #{msg}"
        end
        ws.onclose do
          web_sockets.delete ws
          puts "Browser disconnected."
        end
      end
    end
  end
end
