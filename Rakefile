LIVERELOAD_VERSION = '1.6'
GEM_SRC = FileList["server/lib/*.rb", "server/*.gemspec", "server/bin/*"]
GEM_DIST = "server/livereload-#{LIVERELOAD_VERSION}.gem"


task :chrome do
  content_script = 'LiveReload.chromeextension/LiveReload-content.js'
  File.open content_script, 'w' do |f|
    f.puts File.read('src/content.js') << File.read('src/chrome/content.js')
    puts "+ #{content_script}"
  end

  background_script = 'LiveReload.chromeextension/LiveReload-background.js'
  File.open background_script, 'w' do |f|
    f.puts File.read('src/background.js') << File.read('src/chrome/background.js')
    puts "+ #{background_script}"
  end
end


task :safari do
  injected_script = 'LiveReload.safariextension/LiveReload-injected.js'
  File.open injected_script, 'w' do |f|
    f.puts File.read('src/content.js') << File.read('src/safari/injected.js')
    puts "+ #{injected_script}"
  end

  global_script = 'LiveReload.safariextension/LiveReload-global.js'
  File.open global_script, 'w' do |f|
    f.puts File.read('src/background.js') << File.read('src/safari/global.js')
    puts "+ #{global_script}"
  end
end


task :firefox do
  require 'fileutils'
  dest_dir = 'Firefox/content'
  FileUtils.cp %w(src/background.js src/content.js), dest_dir
  puts "+ #{dest_dir}/background.js"
  puts "+ #{dest_dir}/content.js"
  puts 'LiveReload.xpi: '
  system 'cd Firefox && zip -r ../LiveReload.xpi .'
  puts '+ LiveReload.xpi (drag it into Firefox window to install)'
end


file 'livereload-xbrowser.js' => %w(src/background.js src/content.js src/xbrowser/livereload.js) do |t|
  src = %w(src/background.js src/content.js src/xbrowser/livereload.js).collect { |f| File.read(f).strip }.join("\n") + "\n"
  src.gsub! "host: (navigator.appVersion.indexOf('Linux') >= 0 ? '0.0.0.0' : 'localhost'),", "host: (location.host || 'localhost').split(':')[0],"
  File.open(t.name, 'w') { |f| f.write(src) }
end

file '../LiveReload/livereload.js' => ['livereload-xbrowser.js'] do |t|
  File.open(t.name, 'w') { |f| f.write(File.read(t.prerequisites.first)) }
end

task :xbrowser => 'livereload-xbrowser.js'

desc "Update file bundled with LiveReload 2"
task :lr2 => ['../LiveReload/livereload.js']


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


require 'rake/clean'
CLEAN.include('LiveReload.xpi')
CLOBBER.include(%w(
  LiveReload.chromeextension/LiveReload-content.js
  LiveReload.chromeextension/LiveReload-background.js
  LiveReload.safariextension/LiveReload-injected.js
  LiveReload.safariextension/LiveReload-global.js
  Firefox/content/background.js
  Firefox/content/content.js
))
