Gem::Specification.new do |s|
   s.name = 'livereload'
   s.version = "1.2"

   s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
   s.authors = ["Andrey Tarantsov"]
   s.date = %q{2010-07-11}
   s.description = %q{A command-line server for the LiveReload Safari extension}
   s.email = %q{andreyvit@gmail.com}
   s.extra_rdoc_files = []
   s.files = ["bin/livereload", "lib/livereload.rb"]
   s.homepage = %q{http://github.com/mockko/livereload/}
   s.rdoc_options = ["--charset=UTF-8"]
   s.rubygems_version = %q{1.3.6}
   s.summary = %q{A command-line server for the LiveReload Safari extension}
   s.test_files = []
   s.executables = ['livereload']
   s.requirements << 'LiveReload Safari extension'
   s.add_dependency('em-websocket', '>= 0.1.2')
   s.add_dependency('directory_watcher', '>= 1.3.2')
end
