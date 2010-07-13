
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
    url = url+"";
    var re = /(\?|&)livereload=(\d+)/;
    var m = url.match(re);
    if (!m) { 
        if (url.indexOf('?')==-1) {
            return url + '?livereload=1';
        } else {
            return url + '&livereload=1';
        }
    } else {
        return url.replace(re, function(match, separator, version) {
            return separator+"livereload="+(parseInt(version, 10)+1);
        });
    }
};

function reloadScript(element) {
    console.log("Reloading script: " + element.src);
    var clone = element.cloneNode(false);
    clone.src = this.generateNextUrl(element.src);
    element.parentNode.replaceChild(clone, element);
}

function reloadStylesheet(element) {
    console.log("Reloading stylesheet: " + element.href);
    var clone = element.cloneNode(false);
    clone.href = this.generateNextUrl(element.href);
    insertAfter(clone, element);
    element.reloadingViaLiveReload = 1;
    setTimeout(function() {
        if (element.parentNode)
            element.parentNode.removeChild(element);
    }, 1000);
}

function performLiveReload(data) {
    var parsed = JSON.parse(data);
    var scripts, script, links, link, name, found = false;

    if (parsed[0] != "refresh") {
        console.error("Unknown command: " + parsed[0]);
        return;
    }

    var options = parsed[1];
    var nameToReload = baseName(options.path);
    var applyJSLive = (options.apply_js_live !== undefined ? !!options.apply_js_live : true);
    var applyCSSLive = (options.apply_css_live !== undefined ? !!options.apply_css_live : true);

    if (applyJSLive && !found) {
        scripts = document.getElementsByTagName("script");
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
        links = document.getElementsByTagName("link");
        for (var i = 0; i < links.length; i++) {
            link = links[i];
            if (link.href) {
                name = baseName(link.href);
                if (name == nameToReload) {
                    if (!link.reloadingViaLiveReload) {
                        reloadStylesheet(link);
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
