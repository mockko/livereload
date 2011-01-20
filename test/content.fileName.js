module('Content');

test('fileName', function() {
    equal(LivereloadContent.prototype.fileName('http://elv1s.ru/index.html'), 'index.html');
    equal(LivereloadContent.prototype.fileName('/tmp/livereload/.livereload'), '.livereload');
    equal(LivereloadContent.prototype.fileName('~/Documents/3\\4.html'), '3\\4.html');
});
