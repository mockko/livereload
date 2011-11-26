Gem::Specification.new do |s|
   s.name = 'livereload'
   s.version = "1.6.1"

   s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
   s.authors = ["Andrey Tarantsov"]
   s.date = %q{2011-11-26}
   s.description = <<-END
        LiveReload is a Safari/Chrome extension + a command-line tool that:
        1. Applies CSS and JavaScript file changes without reloading a page.
        2. Automatically reloads a page when any other file changes (html, image, server-side script, etc).
   END
   s.email = %q{andreyvit@gmail.com}
   s.extra_rdoc_files = []
   s.files = ["bin/livereload", "lib/livereload.rb"]
   s.homepage = %q{http://github.com/mockko/livereload/}
   s.rdoc_options = ["--charset=UTF-8"]
   s.rubygems_version = %q{1.3.6}
   s.summary = %q{A command-line server for the LiveReload Safari/Chrome extension}
   s.test_files = []
   s.executables = ['livereload']
   s.requirements << 'LiveReload Safari extension'
   s.add_dependency('em-websocket', '>= 0.3.5')
   s.add_dependency('em-dir-watcher', '>= 0.1')
   s.add_dependency('json', '>= 1.5.3')
end
