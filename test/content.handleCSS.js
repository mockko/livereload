'use strict';

module('Content');

function setupFixture(path, onReady) {
    var iframe = document.createElement('iframe');
    iframe.src = path;
    iframe.id = path;

    var iframe_fixtures = document.getElementById('iframe_fixtures');

    iframe.addEventListener('load', function loaded(e) {
        this.removeEventListener('load', loaded, false);
        var doc = this.contentDocument;
        try {
            var canAccess = !!doc.location;
        } catch (error) {}
        if (canAccess) {
            onReady(this.contentDocument);
        } else {
            ok(false, 'Cannot access an iframe. ' + (navigator.userAgent.indexOf('Chrome') > -1 ? 'Run Google Chrome with --allow-file-access-from-files to fix it.' : ''));
            start();
        }
    }, false);

    iframe_fixtures.appendChild(iframe);

    return iframe;
}

LivereloadContent.prototype.log =
LivereloadContent.prototype.warn = function log(msg) {
    var p = this.document.createElement('p');
    p.appendChild(this.document.createTextNode(msg));
    this.document.body.appendChild(p);
};

asyncTest('handleCSS: link', function(){
    var iframe = setupFixture('fixtures/simple.html', function(document) {
        var lr = new LivereloadContent(document);
        if (lr.strictMode) {
            equal(lr.handleCSS('colors.css'), 0, "Names match, but paths don't");
            equal(lr.handleCSS('typography.css'), 0, "Names match, but paths don't");
            equal(lr.handleCSS('doesnt_exist.css'), 0, "Doesn't match, do nothing");
        } else {
            equal(lr.handleCSS('colors.css'), 1, 'Reload only matched colors.css');
            equal(lr.handleCSS('typography.css'), 1, 'Reload only matched typography.css');
            equal(lr.handleCSS('doesnt_exist.css'), 2, 'Reload both stylesheets');
        }
        start();
    });
});

asyncTest('handleCSS: link: Same file-name, different paths', function(){
    setupFixture('fixtures/widgets.html', function(document){
        var lr = new LivereloadContent(document);
        if (lr.strictMode) {
            var path = location.pathname.slice(0, -(location.hash.length + location.search.length));
            var dir = location.pathname.match(/(.+\/).*$/)[1];
            equal(lr.handleCSS(dir + 'fixtures/colors.css'), 1);
        } else {
            equal(lr.handleCSS('colors.css'), 3);
        }
        start();
    });
});
