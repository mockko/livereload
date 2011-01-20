module('Content');

/**
 * Return substring after the first occurrence of _str_.
 * @param  {string} str
 * @see https://github.com/visionmedia/ext.js/blob/master/lib/ext/core_ext/string/extensions.js
 * @return {string}
 */
String.prototype.after = function(str) {
    var i = this.indexOf(str);
    return i === -1 ?  '' : this.substring(i + str.length);
};

/**
 * Return substring before the first occurrence of _str_.
 * @param  {string} str
 * @return {string}
 */
String.prototype.before = function(str) {
    var i = this.indexOf(str);
    return i === -1 ? '' : this.substring(0, i);
};


test('generateNextUrl', function() {
    var url = LivereloadContent.prototype.generateNextUrl('../icons/browsers.svg?size=100x100#chrome');

    equal(url.after('#'), 'chrome');

    var param = url.before('#').after('?');
    ok(/size=100x100&livereload=\d+/.test(param), 'new livereload param must be appended');

    equal(url.before('?'), '../icons/browsers.svg');

    var styleUrl = 'http://example.com/style.css?livereload=1293305882505';
    url = LivereloadContent.prototype.generateNextUrl(styleUrl);
    ok(url != styleUrl, 'livereload param must be updated');
    ok(/http[:][/][/]example[.]com[/]style[.]css[?]livereload=\d+/.test(url));

});
