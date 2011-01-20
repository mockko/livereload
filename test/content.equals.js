module('Content');

function LR_equals(url, path) {
    var lr = new LivereloadContent(document);
    QUnit.push(lr.equals(url, path), url, path, 'Equal paths');
}

function LR_notEquals(url, path) {
    var lr = new LivereloadContent(document);
    QUnit.push(!lr.equals(url, path), url, path, 'Not equal paths');
}

test('equals', function(){
    LR_equals('file:///tmp/42.html', '/tmp/42.html');
    LR_equals('file://localhost/tmp/42.html', '/tmp/42.html');
    LR_notEquals('file:///tmp/42.htm', '42.htm');

    LR_equals('http://livereload.local/x+1%5Cy=12%3F.html', 'x+1\\y=12?.html');
    LR_notEquals('http://livereload.local/упячка?.html', 'упячка?.html');

    LR_equals('http://cssparser.com/docs/parse.html?q=foo&bar=%2B', 'parse.html');
    LR_equals('http://cssparser.com/docs/parse.html#%D1%8B', 'parse.html');
    LR_equals('http://cssparser.com/docs/parse.html?q=foo&bar=%2B#%D1%8B', 'parse.html');
});
