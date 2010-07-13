require 'em-websocket'
require 'directory_watcher'

# Chrome sometimes sends HTTP/1.0 requests in violation of WebSockets spec
EventMachine::WebSocket::HandlerFactory::PATH = /^(\w+) (\/[^\s]*) HTTP\/1\.[01]$/

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
  GEM_VERSION = "1.2.2"
  API_VERSION = "1.2"

  PROJECT_CONFIG_FILE_TEMPLATE = <<-END.strip.split("\n").collect { |line| line.strip + "\n" }.join("")
  # Lines starting with pound sign (#) are ignored.

  # additional extensions to monitor
  #config.exts += ['haml', 'mytempl']
  END

  # note that host and port options do not make sense in per-project config files
  class Config
    attr_accessor :host, :port, :exts, :debug

    def initialize &block
      @host  = nil
      @port  = nil
      @debug = nil
      @exts  = []

      update!(&block) if block
    end

    def update!
      yield self

      # remove leading dots
      @exts = @exts.collect { |e| e.sub(/^\./, '') }
    end

    def merge! other
      @host   = other.host  if other.host
      @port   = other.port  if other.port
      @exts  += other.exts
      @debug  = other.debug if other.debug != nil

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
        configs.reduce(Config.new) { |merged, config| config && merged.merge!(config) || merged }
      end
    end
  end

  DEFAULT_CONFIG = Config.new do |config|
    config.debug = false
    config.host  = '0.0.0.0'
    config.port  = 10083
    config.exts  = %w/html css js png gif jpg php php5 py rb erb/
  end

  USER_CONFIG_FILE = File.expand_path("~/.livereload")
  USER_CONFIG = Config.load_from(USER_CONFIG_FILE)

  class Project
    def initialize directory, explicit_config=nil
      @directory = directory

      project_config_file = File.join(directory, '.livereload')
      unless File.file? project_config_file
        File.open(project_config_file, 'w') do |file|
          file.write PROJECT_CONFIG_FILE_TEMPLATE
        end
      end
      project_config = Config.load_from project_config_file
      @config = Config.merge(DEFAULT_CONFIG, USER_CONFIG, project_config, explicit_config)
    end

    def print_config
      puts "Watching: #{@directory}"
      puts "  - extensions: " + @config.exts.collect {|e| ".#{e}"}.join(" ")
    end

    def start_watching
      dw = DirectoryWatcher.new @directory, :glob => "**/*.{#{@config.exts.join(',')}}", :scanner => :em
      dw.add_observer do |*args|
        args.each do |event|
          if event[:type] == :modified
            name = File.basename(event[:path])
            yield name
          end
        end
      end
      dw.start
    end
  end

  def self.configure
    yield Config
  end

  def self.run(directory, explicit_config)
    # EventMachine needs to run kqueue for the watching API to work
    EM.kqueue = true if EM.kqueue?

    web_sockets = []

    # for host and port
    global_config = Config.merge(DEFAULT_CONFIG, USER_CONFIG)
    project = Project.new(directory, explicit_config)

    puts
    puts "Version:  #{GEM_VERSION}  (compatible with browser extension versions #{API_VERSION}.x)"
    puts "Port:     #{global_config.port}"
    project.print_config

    EventMachine.run do
      project.start_watching do |modified_file|
        puts "Modified: #{modified_file}"
        web_sockets.each do |ws|
          ws.send modified_file
        end
      end

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
