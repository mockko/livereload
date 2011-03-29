'use strict';

function LivereloadContent(document) {
    this.document = document;
    this.strictMode = this.strictModePossible(document);
}

LivereloadContent.prototype = {

    apply_js_live: false,
    apply_css_live: true,
    apply_images_live: true,

    /**
     * Very unstable!
     * ''           Never
     * 'match'      On exact match
     * 'restricted' On exact match and restricted stylesheet (e.g. from another domain)
     * 'always'     Reload all imported stylesheets every time
     */
    apply_imported_css: '',

    strictMode: false,

    strictModePossible: function(document) {
        return document.location.protocol == 'file:';
    },

    /**
     * @param {string} path
     * @nosideeffects
     * @return {string}
     */
    fileName: function(path) {
        return path
            .replace(/\?.*$/, '')  // strip query string if any
            .replace(/^.*\//, '');
    },

    /**
     * @param {string} url
     * @param {string} path
     * @nosideeffects
     * @return {boolean} paths the same
     */
    equals: function(url, path) {
        var paramsIndex = url.indexOf('?');
        if (paramsIndex != -1) {
            url = url.slice(0, paramsIndex);
        } else {
            var hashIndex = url.indexOf('#');
            if (hashIndex != -1) {
                url = url.slice(0, hashIndex);
            }
        }
        if (url.indexOf('file://') == 0) {
            url = url.replace(/file:[/][/](localhost)?/, '');
        } else {
            url = this.fileName(url);
        }
        return decodeURIComponent(url) == path;
    },

    /**
     * @param {string} name
     * @nosideeffects
     * @return {string}
     */
    fileExtension: function(name) {
        var base = this.fileName(name);
        var matched = base.match(/\.[^.]+$/);
        return matched ? matched[0] : '';
    },

    /**
     * @nosideeffects
     * @return {string}
     */
    generateExpando: function() {
        return 'livereload=' + Date.now();
    },

    /**
     * @param {string} msg
     */
    log: function(msg) {
        if (window.console && console.log) {
            console.log(msg);
        }
    },

    /**
     * @param {string} msg
     */
    warn: function(msg) {
        if (window.console && console.warn) {
            console.warn(msg);
        }
    },

    /**
     * @param {string} url
     * @param {string} [expando]
     * @nosideeffects
     * @return {string}
     */
    generateNextUrl: function(url, expando) {
        expando = expando || this.generateExpando();

        var hashIndex = url.indexOf('#');
        var hash = '';
        if (hashIndex != -1) {
            hash = url.slice(hashIndex);
            url = url.slice(0, hashIndex);
        }

        var paramsIndex = url.indexOf('?');
        var params = '';
        if (paramsIndex != -1) {
            params = url.slice(paramsIndex);
            var re = /(\?|&)livereload=(\d+)/;
            if (re.test(params)) {
                params = params.replace(re, function(match, separator) {
                    return separator + expando;
                });
            } else {
                params += '&' + expando;
            }
            url = url.slice(0, paramsIndex);
        } else {
            params += '?' + expando;
        }

        return url + params + hash;
    },

    /**
     * @deprecated
     * @param {Element} script
     */
    reloadScript: function(script) {
        this.log('Reloading script: ' + script.src);
        var clone = script.cloneNode(false);
        clone.src = this.generateNextUrl(script.src);
        script.parentNode.replaceChild(clone, script);
    },

    /**
     *
     * @param {CSSStyleSheet} stylesheet
     */
    reloadStylesheet: function(stylesheet) {
        if (stylesheet.ownerNode) {
            this.reattachStylesheetLink(stylesheet.ownerNode)
        } else if (stylesheet.ownerRule) {
            this.reattachImportedRule(stylesheet.ownerRule);
        }
    },

    reattachStylesheetLink: function(link) {
        this.log('Reloading stylesheet: ' + link.href);

        if (link.__pendingRemoval) {
            this.warn('Attempt to reload a stylesheet that pending for removal.');
            return 0;
        }
        link.__pendingRemoval = true;

        var clone = link.cloneNode(false);
        clone.href = this.generateNextUrl(link.href);

        var parent = link.parentNode;
        if (parent.lastChild == link) {
            parent.appendChild(clone);
        } else {
            parent.insertBefore(clone, link.nextSibling);
        }

        if ('sheet' in clone) {
            var intervalId = setInterval(function() {
                if (clone.sheet) {
                    removeOld();
                }
            }, 20);
        }

        var timeoutId = setTimeout(removeOld, 1000);

        function removeOld() {
            intervalId && clearInterval(intervalId);
            timeoutId && clearTimeout(timeoutId);
            link.parentNode && link.parentNode.removeChild(link);
        }

        return 1;
    },

    /**
     * Recursevly reload all stylesheets that matches nameToReload
     * @param {CSSStyleSheet} stylesheet
     * @param {string} [nameToReload] reload all stylesheets when omitted
     * @return {number} found items count
     */
    reloadImportedStylesheet: function(stylesheet, nameToReload) {

        try {
            var rules = stylesheet.cssRules;
        } catch(error) {
            this.warn(error.message);
        }
        if (!rules) {
            this.warn('Cannot access ' + stylesheet.href);
            this.reloadStylesheet(stylesheet);
            return 1;
        }

        var found = 0;
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            switch (rule.type) {
                case CSSRule.CHARSET_RULE:
                    // Only charset rules can precede import rules
                    continue;
                case CSSRule.IMPORT_RULE:
                    var href = rule.href;
                    if (!nameToReload || this.equals(href, nameToReload)) {
                        this.reattachImportedRule(rule, i);
                        found = 1;
                    } else {
                        found = this.reloadImportedStylesheet(rule.styleSheet, nameToReload) || found;
                    }
                    break;
                default:
                    return found;
            }
        }
        return found;
    },

    reattachImportedRule: function(rule, index) {
        var parent = rule.parentStyleSheet;
        if (index === undefined) {
            if (rule.parentRule) {
                throw '@import inside CSS rule? Impossible!';
            }
            index = [].indexOf.call(parent.cssRules, rule);
        }
        var href = rule.href;
        this.log('Reloading imported stylesheet: ' + href);
        var media = rule.media.length ? [].join.call(rule.media, ', ') : '';
        parent.insertRule('@import url("' + this.generateNextUrl(href) + '") ' + media + ';', index);
        parent.deleteRule(index + 1);
    },

    /**
     * Recursevly reload all background-image and border-image properties
     * @param {CSSStyleSheet|CSSMediaRule} stylesheet
     * @param {string} nameToReload
     * @param {string} expando
     * @return {Array} reloaded rules
     */
    reloadStylesheetImages: function(stylesheet, nameToReload, expando) {

        var result = [];

        var rules = stylesheet.cssRules;
        if (!rules) {
            this.warn('Can\'t access stylesheet: ' + stylesheet.href);
            return false;
        }

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            switch (rule.type) {
                case CSSRule.IMPORT_RULE:
                    if (rule.href) {
                        result.push.apply(result, this.reloadStylesheetImages(rule.styleSheet, nameToReload, expando));
                    }
                    break;
                case CSSRule.STYLE_RULE:
                    var found = false;
                    if (rule.style.backgroundImage) {
                        var backgroundImage = this.extractURL(rule.style.backgroundImage);
                        if (this.equals(backgroundImage, nameToReload)) {
                            rule.style.backgroundImage = 'url(' + this.generateNextUrl(backgroundImage, expando) + ')';
                            found = true;
                        }
                    }
                    if (rule.style.borderImage) {
                        var borderImage = this.extractURL(rule.style.borderImage);
                        if (this.equals(borderImage, nameToReload)) {
                            rule.style.borderImage = 'url(' + this.generateNextUrl(borderImage, expando) + ')';
                            found = true;
                        }
                    }
                    if (found) {
                        result.push(rule);
                    }
                    break;
                case CSSRule.MEDIA_RULE:
                    result.push.apply(result, this.reloadStylesheetImages(rule, nameToReload, expando));
                    break;
            }
        }

        return result;
    },

    /**
     *   extractURL('url(ferrets.jpg)')
     *   -> 'ferrets.jpg'
     *
     * @param {string} url
     * @nosideeffects
     * @return {string}
     */
    extractURL: function(url) {
        return url.slice(4).slice(0, -1);
    },

    handleJS: function(path, options) {
        var reloaded = 0;

        options = options || {};
        if (!options.apply_js_live) {
            this.handleDefault(path, options);
            return reloaded;
        }

        var scripts = [].slice.call(this.document.scripts, 0);
        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            if (script.src && this.equals(script.src, path)) {
                this.reloadScript(script);
                reloaded++;
            }
        }

        return reloaded;
    },

    handleCSS: function(path, options) {
        var reloaded = 0;

        if (options && !options.apply_css_live) {
            this.handleDefault(path, options);
            return reloaded;
        }

        var links = this.document.querySelectorAll('link[rel="stylesheet"]');
        // Clone it to avoid changes.
        links = [].slice.call(links, 0);
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (this.equals(link.href, path)) {
                reloaded += this.reattachStylesheetLink(link);
            } else if (this.apply_imported_css) {
                try {
                    // cssRules might be null in WebKit
                    var stylesheet = link.sheet;
                    var canAccess = !!stylesheet.cssRules;
                } catch (error) {
                    // Firefox and Opera might throw an error
                    this.warn(error.message);
                }
                if (canAccess && this.apply_imported_css >= 2) {
                    reloaded += this.reloadImportedStylesheet(stylesheet, (this.apply_imported_css >= 3 ? '' : path));
                } else {
                    reloaded += this.reattachStylesheetLink(link);
                }
            }
        }

        if (this.apply_imported_css) {
            var styles = this.document.getElementsByTagName('style');
            for (var j = 0; j < styles.length; j++) {
                var sheet = styles[j].sheet;
                if (!sheet) {
                    continue;
                }
                reloaded += this.reloadImportedStylesheet(sheet, path);
            }
        }

        if (!reloaded) {
            if (this.strictMode) {
                this.log('LiveReload: "' + path + '" does not correspond to any stylesheet. Do nothing.');
            } else {
                this.log('LiveReload: "' + path + '" does not correspond to any stylesheet. Reloading all of them.');
                for (i = 0; i < links.length; i++) {
                    reloaded += this.reattachStylesheetLink(links[i]);
                }
                if (this.apply_imported_css) {
                    for (j = 0; j < styles.length; j++) {
                        reloaded += this.reloadImportedStylesheet(styles[i]);
                    }
                }
            }
        }

        return reloaded;
    },

    handleImages: function(path, options) {
        var reloaded = 0;

        if (options && !options.apply_images_live) {
            this.handleDefault(path);
            return reloaded;
        }

        var stylesheets = this.document.styleSheets;
        var imgs = this.document.images;
        var expando = this.generateExpando();
        for (var i = 0; i < imgs.length; i++) {
            var img = imgs[i];
            if (this.equals(img.src, path)) {
                img.src = this.generateNextUrl(img.src, expando);
                reloaded++;
            }
        }
        var src;
        imgs = this.document.querySelectorAll('[style*=background]');
        for (i = 0; i < imgs.length; i++) {
            img = imgs[i];
            if (!img.style.backgroundImage) {
                continue;
            }
            src = this.extractURL(img.style.backgroundImage);
            if (src && this.equals(src, path)) {
                img.style.backgroundImage = 'url(' + this.generateNextUrl(src, expando) + ')';
                reloaded++;
            }
        }

        imgs = this.document.querySelectorAll('[style*=border]');
        for (i = 0; i < imgs.length; i++) {
            img = imgs[i];
            if (!img.style.borderImage) {
                continue;
            }
            src = this.extractURL(img.style.borderImage);
            if (src && this.equals(src, path)) {
                img.style.borderImage = 'url(' + this.generateNextUrl(src, expando) + ')';
                reloaded++;
            }
        }

        for (i = 0; i < stylesheets.length; i++) {
            reloaded += this.reloadStylesheetImages(stylesheets[i], path, expando).length;
        }

        return reloaded;
    },

    handleHTML: function(path) {
        if (this.document.location.protocol == 'file:') {
            if (this.equals(document.location.href, path)) {
                this.document.location.reload();
            } else {
                this.log(path + ' does not match any file. Do nothing.');
            }
        } else {
            this.document.location.reload();
        }
    },

    handleDefault: function(path) {
        this.document.location.reload();
    },

    /**
     * @param {Object} options
     * @nosideeffects
     * @return {Object}
     */
    mergeConfig: function(options) {
        if (!this.strictMode) {
            options.path = this.fileName(options.path);
        }
        if (options.apply_js_live === undefined) {
            options.apply_js_live = this.apply_js_live;
        }
        if (options.apply_css_live === undefined) {
            options.apply_css_live = this.apply_css_live;
        }
        if (options.apply_images_live === undefined) {
            options.apply_images_live = this.apply_images_live;
        }
        return options;
    },

    /**
     * @param {string} data is a JSON such as '["refresh", {"path": "/tmp/index.html"}'
     */
    reload: function(data) {
        var parsed = JSON.parse(data);
        if (parsed[0] != 'refresh') {
            throw 'Unknown command: ' + parsed[0];
        }
        var options = this.mergeConfig(parsed[1]);
        var path = options.path || '';
        var extension = this.fileExtension(path);

        if (typeof this[extension] == 'function') {
            this[extension](path, options);
        } else {
            this.handleDefault(path, options);
        }
    },

    constructor: LivereloadContent
};

LivereloadContent.prototype['.js'] = LivereloadContent.prototype.handleJS;
LivereloadContent.prototype['.css'] = LivereloadContent.prototype.handleCSS;
LivereloadContent.prototype['.sass'] = LivereloadContent.prototype.handleCSS;
LivereloadContent.prototype['.scss'] = LivereloadContent.prototype.handleCSS;
LivereloadContent.prototype['.jpg'] =
LivereloadContent.prototype['.jpeg'] =
LivereloadContent.prototype['.png'] =
LivereloadContent.prototype['.gif'] = LivereloadContent.prototype.handleImages;
LivereloadContent.prototype['.html'] =
LivereloadContent.prototype['.htm'] =
LivereloadContent.prototype['.xhtml'] =
LivereloadContent.prototype['.xml'] = LivereloadContent.prototype.handleHTML;

