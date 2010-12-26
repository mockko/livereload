/**
 * @see https://github.com/visionmedia/ext.js/blob/master/lib/ext/core_ext/string/extensions.js
 */


/**
 * Return substring after the first occurrence of _str_.
 * @param  {string} str
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


function appendStyleSheet(url) {
    var head = document.head || document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', url);
    head.appendChild(link);
    return link;
}
