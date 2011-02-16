if (!Function.prototype.bind) {
    /**
     * @param {Object} thisObject
     * @nosideeffects
     * @see http://trac.webkit.org/browser/trunk/Source/WebCore/inspector/front-end/utilities.js
     * @return {Function}
     */
    Function.prototype.bind = function(thisObject) {
        var func = this;
        var args = Array.prototype.slice.call(arguments, 1);
        function bound() {
            return func.apply(thisObject, args.concat(Array.prototype.slice.call(arguments, 0)));
        }
        bound.toString = function() {
            return 'bound: ' + func;
        };
        return bound;
    }
}


function SafariLivereloadGlobal() {}
SafariLivereloadGlobal.prototype = new LivereloadBackground(function reloadTab(tab, data) {
    tab.page.dispatchMessage('LiveReload', data);
});


SafariLivereloadGlobal.prototype.connect = function () {
    if (safari.extension.settings.host) this.host = safari.extension.settings.host;
    else this.host = this.__proto__.__proto__.host;

    if (safari.extension.settings.port) this.port = safari.extension.settings.port;
    else this.port = this.__proto__.__proto__.port;

    this.__proto__.__proto__.connect.call(this);
};

SafariLivereloadGlobal.prototype.sendPageUrl = function() {
    var activePage = this.lastPage;
    if (activePage == null) {
        throw 'No active page';
    }
    this.socket && this.socket.send(activePage.href);
};

SafariLivereloadGlobal.prototype.alert = function(message) {
    console.error(message);
};

// http://stackoverflow.com/questions/4587500/catching-close-tab-event-in-a-safari-extension
SafariLivereloadGlobal.prototype.killZombies = function() {
    for (var i = this.pages.length; i--;) {
        if (!this.pages[i].url) {
            this.pages.splice(i, 1);
        }
    }
};

SafariLivereloadGlobal.prototype.togglePage = function(tab) {
    this.killZombies();
    this.__proto__.__proto__.togglePage.call(this, tab);
};

SafariLivereloadGlobal.prototype._onmessage = function(event) {
    this.killZombies();
    this.__proto__.__proto__._onmessage.call(this, event);
};

SafariLivereloadGlobal.prototype.constructor = SafariLivereloadGlobal;


var livereload = new SafariLivereloadGlobal;

safari.application.addEventListener('command', function(event) {
    if (event.command == 'enable') {
        var tab = safari.application.activeBrowserWindow.activeTab;
        livereload.togglePage(tab);
    }
}, false);

safari.application.addEventListener('validate', function(event) {
    var tab = safari.application.activeBrowserWindow.activeTab;
    if (livereload.pages.indexOf(tab) == -1) {
        event.target.title = 'Enable LiveReload';
    } else {
        event.target.title = 'Disable LiveReload';
    }
}, false);

safari.extension.settings.addEventListener("change", function(event) {
    livereload.disconnect();
}, false);
