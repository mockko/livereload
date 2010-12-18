
LIVERELOAD_VERSION = '1.5'
GEM_SRC = FileList["server/lib/*.rb", "server/*.gemspec", "server/bin/*"]
GEM_DIST = "server/livereload-#{LIVERELOAD_VERSION}.gem"

task :chrome do
  path = 'LiveReload.chromeextension/LiveReload-content.js'
  File.open path, 'w' do |f|
    f.puts File.read('src/core.js') << File.read('src/chrome.js')
  end
  puts "+ #{path}"
end

task :safari do
  path = 'LiveReload.safariextension/LiveReload-injected.js'
  File.open path, 'w' do |f|
    f.puts File.read('src/core.js') << File.read('src/safari.js')
  end
  puts "+ #{path}"
end

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
