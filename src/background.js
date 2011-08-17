'use strict';

/**
 * @param {Function} reloadPage function(page, data){}
 */
function LivereloadBackground(reloadPage) {
    this.reloadPage = reloadPage;
    this.pages = [];
    this.socket = null;
    this.disconnectionReason = 'unexpected';
    this.versionInfoReceived = false;
}

LivereloadBackground.prototype = {

    apiVersion: '1.6',

    // localhost does not work on Linux b/c of http://code.google.com/p/chromium/issues/detail?id=36652,
    // 0.0.0.0 does not work on Windows
    host: (navigator.appVersion.indexOf('Linux') >= 0 ? '0.0.0.0' : 'localhost'),

    port: 35729,

    get uri(){
        return 'ws://' + this.host + ':' + this.port + '/websocket';
    },

    addPage: function(page) {
        var index = this.pages.indexOf(page);
        if (index == -1) {
            this.pages.push(page);
        }
    },

    get lastPage() {
        var length = this.pages.length;
        return length ? this.pages[length - 1] : null;
    },

    alert: function(message) {
        alert(message);
    },

    log: function(message) {
        if (window.console && console.log) {
            console.log('LiveReload ' + message);
        }
    },

    versionAsFloat: function(version) {
        var triple = version.split('.').map(function(n){
            return parseInt(n);
        });
        return parseFloat(triple[0] + '.' + triple[1]);
    },

    /**
     * @param {string} data
     * @return {boolean} true on succes, false on error
     */
    checkVersion: function(data) {
        var m = data.match(/!!ver:([\d.]+)/);
        if (m) {
            var server = this.versionAsFloat(m[1]);
            var client = this.versionAsFloat(this.apiVersion);
            // Compare only major and minor versions. Do not compare patch version.
            if (server == client) {
                return true;
            } else {
                if (server < client) {
                    this.alert('You need to update the command-line tool to continue using LiveReload.\n\n'
                        + 'Extension version: ' + this.apiVersion + '\n'
                        + 'Command-line tool version: ' + m[1] + '\n\n'
                        + 'Please run the following command to update your command-line tool:\n'
                        + '    gem update livereload');
                } else {
                    this.alert('You need to update the browser extension to continue using LiveReload.\n\n'
                        + 'Extension version: ' + this.apiVersion + '\n'
                        + 'Command-line tool version: ' + m[1] + '\n\n'
                        + 'Please go to the extensions manager and check for updates.');
                }
            }
        } else {
            this.alert('You are using an old incompatible version of the command-line tool.\n\n'
                + 'Please run the following command to update your command-line tool:\n'
                + '    gem update livereload');
        }
        return false;
    },

    reloadPages: function(data) {
        for (var i = this.pages.length; i--;) {
            this.reloadPage(this.pages[i], data);
        }
    },

    _onmessage: function(event) {
        if (this.pages.length == 0) {
            throw 'No pages';
        }
        var data = event.data;
        this.log('received: ' + data);
        if (!this.versionInfoReceived) {
            if (this.checkVersion(data)) {
                this.versionInfoReceived = true;
            } else {
                this.disconnectionReason = 'version-mismatch';
                event.target.close();
            }
        } else {
            this.reloadPages(data);
        }
    },

    _onclose: function(e) {
        this.log('disconnected from ' + (e.target.URL || e.target.url));
        if (this.disconnectionReason == 'cannot-connect') {
            this.alert('Cannot connect to LiveReload server:\n' + this.uri);
        }
        this.onDisconnect();
    },

    _onopen: function(e) {
        this.log('connected to ' + (e.target.URL || e.target.url));
        this.disconnectionReason = 'broken';
        this.sendPageUrl();
    },

    _onerror: function(event) {
        console.warn('error: ', event);
    },

    connect: function() {
        var Socket = window.MozWebSocket || window.WebSocket;
        if (!Socket) {
            if (window.opera) {
                throw 'WebSocket is disabled. To turn it on, open \nopera:config#UserPrefs|EnableWebSockets and check in the checkbox.';
            } else if (navigator.userAgent.indexOf('Firefox/') != -1) {
                throw 'WebSocket is disabled.\nTo turn it on, open about:config and set network.websocket.override-security-block to true.\nhttps://developer.mozilla.org/en/WebSockets';
            }
        }

        if (this.socket) {
            throw 'WebSocket already opened';
        }

        var socket = this.socket = new Socket(this.uri);

        this.disconnectionReason = 'cannot-connect';
        this.versionInfoReceived = false;

        var self = this;
        socket.onopen    = function(e) { return self._onopen(e); };
        socket.onmessage = function(e) { return self._onmessage(e); };
        socket.onclose   = function(e) { return self._onclose(e); };
        socket.onerror   = function(e) { return self._onerror(e); };
    },

    disconnect: function() {
        this.disconnectionReason = 'manual';
        if (this.socket) {
            this.socket.close();
        }
    },

    onDisconnect: function() {
        this.socket = null;
        this.versionInfoReceived = false;
        this.disableAllPages();
    },

    sendPageUrl: function() {
        var activePage = this.lastPage;
        if (activePage == null) {
            throw 'No active page';
        }
        this.socket && this.socket.send(activePage.location.href);
    },

    enablePage: function(page) {
        if (this.pages.indexOf(page) > -1) {
            throw 'Page alredy enabled';
        }
        this.pages.push(page);
        if (this.socket && this.socket.readyState == 1) {
            this.sendPageUrl();
        } else {
            try {
                this.connect();
            } catch(e) {
                this.alert('LiveReload failed to establish connection: ' + (e && e.message || e));
                return;
            }
        }
        this.onEnablePage(page);
    },

    onEnablePage: function(page) {},

    disablePage: function(page) {
        var index = this.pages.indexOf(page);
        if (index > -1) {
            //TODO: log on the server about disconected pages
            if (this.pages.length == 1) {
                this.disconnect();
            } else {
                this.pages.splice(index, 1);
                this.onDisablePage(page);
            }
        }
    },

    onDisablePage: function(page) {},

    disableAllPages: function() {
        for (var i = this.pages.length; i--;) {
            this.onDisablePage(this.pages[i]);
        }
        this.pages.length = 0;
    },

    togglePage: function(page) {
        var index = this.pages.indexOf(page);
        if (index == -1) {
            this.enablePage(page);
        } else {
            this.disablePage(page);
        }
    },

    constructor: LivereloadBackground 

};

