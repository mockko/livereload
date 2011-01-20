module('Content');

test('fileExtension', function() {
    equal(LivereloadContent.prototype.fileExtension('http://elv1s.ru/main.css'), '.css');
    equal(LivereloadContent.prototype.fileExtension('file:///Users/nv/Code/livereload/test/index.html'), '.html');
    equal(LivereloadContent.prototype.fileExtension('/tmp/livereload/.livereload'), '.livereload');
    equal(LivereloadContent.prototype.fileExtension('foo\\bar/Guardfile'), '');
});
