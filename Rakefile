require 'rake/clean'

LIVERELOAD_VERSION = '1.6'
GEM_SRC = FileList["server/lib/*.rb", "server/*.gemspec", "server/bin/*"]
GEM_DIST = "server/livereload-#{LIVERELOAD_VERSION}.gem"


class FileGroup

  attr_reader :sources, :mapping

  def initialize sources, &mapping
    @sources = sources
    @mapping = mapping
  end

  def targets
    @targets ||= @sources.map { |source| @mapping.call(source) }
  end

  def each
    @sources.each do |source|
      yield source, @mapping.call(source)
    end
  end

  def rule
    each do |source, target|
      file target => [source] do |t|
        yield source, target
      end
    end
  end

  def self.[] *args
    self.new(*args)
  end

end


def copy_source dest, *sources
  File.open(dest, 'w') do |df|
    df.write sources.map { |fn| File.read(fn) }.join("\n")
  end
end


file 'LiveReload.chromeextension/LiveReload-content.js' => ['src/content.js', 'src/chrome/content.js'] do |t|
  copy_source t.name, *t.prerequisites
end

file 'LiveReload.chromeextension/LiveReload-background.js' => ['src/background.js', 'src/chrome/background.js'] do |t|
  copy_source t.name, *t.prerequisites
end

desc "Prepare the Chome extension"
task :chrome => ['LiveReload.chromeextension/LiveReload-content.js', 'LiveReload.chromeextension/LiveReload-background.js']


file 'LiveReload.safariextension/LiveReload-injected.js' => ['src/content.js', 'src/safari/injected.js'] do |t|
  copy_source t.name, *t.prerequisites
end

file 'LiveReload.safariextension/LiveReload-global.js' => ['src/background.js', 'src/safari/global.js'] do |t|
  copy_source t.name, *t.prerequisites
end

desc "Prepare the Safari extension"
task :safari => ['LiveReload.safariextension/LiveReload-injected.js', 'LiveReload.safariextension/LiveReload-global.js']

FIREFOX_INTERIM = FileGroup.new(%w[src/background.js src/content.js]) { |f| File.join('Firefox/content', File.basename(f)) }
FIREFOX_BASIC = FileList['Firefox/**/*.{js,xul,manifest,rdf}'] - FIREFOX_INTERIM.targets
FIREFOX_ALL = FIREFOX_BASIC + FIREFOX_INTERIM.targets

FIREFOX_INTERIM.rule do |source, target|
  copy_source target, source
end

file 'LiveReload.xpi' => FIREFOX_ALL do |t|
  full_dst = File.expand_path(t.name)
  Dir.chdir 'Firefox' do
    sh 'zip', full_dst, *t.prerequisites.map { |f| f.sub(%r!^Firefox/!, '') }
  end
end

desc "Build the Firefox extension"
task :firefox => 'LiveReload.xpi'


file 'livereload-xbrowser.js' => %w(src/background.js src/content.js src/xbrowser/livereload.js) do |t|
  src = %w(src/background.js src/content.js src/xbrowser/livereload.js).collect { |f| File.read(f).strip }.join("\n") + "\n"
  src.gsub! "host: (navigator.appVersion.indexOf('Linux') >= 0 ? '0.0.0.0' : 'localhost'),", "host: (location.host || 'localhost').split(':')[0],"
  File.open(t.name, 'w') { |f| f.write(src) }
end

file '../LiveReload/livereload.js' => ['livereload-xbrowser.js'] do |t|
  File.open(t.name, 'w') { |f| f.write(File.read(t.prerequisites.first)) }
end

desc "Build the cross-browser version"
task :xbrowser => 'livereload-xbrowser.js'


desc "Update the file bundled with LiveReload 2"
task :lr2 => ['../LiveReload/livereload.js']


desc "Process all browser extensions"
task :all => [:safari, :chrome, :firefox, :xbrowser]

task :default => :all

namespace :gem do
   file GEM_DIST => GEM_SRC do
      cd 'server' do
         sh 'gem', 'build', 'livereload.gemspec'
      end
   end

   desc "Build the livereload gem"
   task :build => GEM_DIST

   desc "Install the livereload gem/command"
   task :install => :build do
      sh 'sudo', 'gem', 'install', GEM_DIST
   end

   desc "Uninstall the livereload gem/command"
   task :uninstall do
      sh 'sudo', 'gem', 'uninstall', 'livereload'
   end

   desc "Publish the gem on gemcutter"
   task :publish => :build do
      sh 'gem', 'push', GEM_DIST
   end
end


task :test do
  #`python -m SimpleHTTPServer`

  require 'webrick'
  # http://tobyho.com/HTTP_Server_in_5_Lines_With_Webrick
  class NonCachingFileHandler < WEBrick::HTTPServlet::FileHandler
    def prevent_caching(res)
      res['ETag']          = nil
      res['Last-Modified'] = Time.now + 100**4
      res['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
    end

    def do_GET(req, res)
      super
      prevent_caching(res)
    end

  end

  serv = Thread.new() {
    server = WEBrick::HTTPServer.new :Port => 8000
    server.mount('/', NonCachingFileHandler, './')
    puts 'http://0.0.0.0:8000 started'
    server.start
  }

  serv2 = Thread.new() {
    server = WEBrick::HTTPServer.new :Port => 8001
    server.mount('/', NonCachingFileHandler, './')
    puts 'http://0.0.0.0:8001 started'
    server.start
  }

  `open http://0.0.0.0:8000/test` unless `which open`.empty?
  serv.join
  serv2.join
end


CLEAN.include('LiveReload.xpi')
CLOBBER.include(%w(
  LiveReload.chromeextension/LiveReload-content.js
  LiveReload.chromeextension/LiveReload-background.js
  LiveReload.safariextension/LiveReload-injected.js
  LiveReload.safariextension/LiveReload-global.js
  Firefox/content/background.js
  Firefox/content/content.js
))
