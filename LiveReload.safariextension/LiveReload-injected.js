
function baseName(s) {
    return s
        .replace(/\?.*$/, '')  // strip query string if any
        .replace(/\\/, '/')    // Windows backward slashes
        .replace(/^.*\//, '')  // strip the path
        .replace(/^.*:/, '');  // strip the drive part for rare cases like "c:foo.txt" (yeah, I'm paranoid)
}

var insertAfter = function(newElement, targetElement) {
    var parent = targetElement.parentNode;
    if (parent.lastChild == targetElement) {
        parent.appendChild(newElement);
    } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
    }
};

var generateNextUrl = function(url) {
    var genSuffix = function(separator, prevIndex) {
        var date = Date.now() + "";
        var rand = (1+(Math.random()*0x10000)|0);
        return separator + "livereload=" + (parseInt(prevIndex, 10) + 1)
            + '-' + date + '-' + rand;
    }
    url = url+"";
    var re = /(\?|&)livereload=(\d+)-(\d+)-(\d+)/;
    var m = url.match(re);
    if (!m) { 
        return url + genSuffix(url.indexOf('?') == -1 ? '?' : ':', 0)
    } else {
        return url.replace(re, function(match, separator, prevIndex, d, r) {
            return genSuffix(separator, prevIndex);
        });
    }
};

function reloadScript(element) {
    console.log("Reloading script: " + element.src);
    var clone = element.cloneNode(false);
    clone.src = this.generateNextUrl(element.src);
    element.parentNode.replaceChild(clone, element);
}

function reloadStylesheet(stylesheet) {
    console.log("Reloading stylesheet: " + stylesheet.href);
    var element = stylesheet.ownerNode;
    var clone = element.cloneNode(false);
    clone.href = this.generateNextUrl(element.href);
    insertAfter(clone, element);
    stylesheet.reloadingViaLiveReload = 1;
    setTimeout(function() {
        if (element.parentNode)
            element.parentNode.removeChild(element);
    }, 1000);
}

function performLiveReload(data) {
    var parsed = JSON.parse(data);
    var scripts, script, stylesheets, stylesheet, name, found = false;

    if (parsed[0] != "refresh") {
        console.error("Unknown command: " + parsed[0]);
        return;
    }

    var options = parsed[1];
    var nameToReload = baseName(options.path);
    var applyJSLive = (options.apply_js_live !== undefined ? !!options.apply_js_live : true);
    var applyCSSLive = (options.apply_css_live !== undefined ? !!options.apply_css_live : true);

    if (applyJSLive && !found) {
        scripts = document.scripts;
        for (var i = 0; i < scripts.length; i++) {
            script = scripts[i];
            if (script.src) {
                name = baseName(script.src);
                if (name == nameToReload) {
                    reloadScript(script);
                    found = true;
                    break;
                }
            }
        }
    }

    if (applyCSSLive && !found) {
        stylesheets = document.styleSheets;
        for (var i = 0; i < stylesheets.length; i++) {
            stylesheet = stylesheets[i];
            if (stylesheet.href) {
                name = baseName(stylesheet.href);
                if (name == nameToReload) {
                    if (!stylesheet.reloadingViaLiveReload) {
                        reloadStylesheet(stylesheet);
                        found = true;
                        break;
                    }
                }
            }
        }
    }

    if (!found) {
        console.log("LiveReload: reloading the full page because \"" + nameToReload + "\" does not correspond to any SCRIPT or LINK.")
        window.location.reload();
    }
}

// Safari

safari.self.addEventListener("message", function(event) {
    if (event.name == 'LiveReload') {
        performLiveReload(event.message)
    }
}, false);
