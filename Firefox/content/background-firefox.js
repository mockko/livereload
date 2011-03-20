function LivereloadBackgroundFirefox() {}
LivereloadBackgroundFirefox.prototype = new LivereloadBackground(function reloadPage(tab, data) {
    var client = new LivereloadContent(tab.linkedBrowser.contentDocument);
    client.reload(data);
});

LivereloadBackgroundFirefox.prototype.connect = function () {
	var self = this;

	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("livereload.");
    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
    this.prefs.addObserver("", {observe: function () {
        self.disconnect();
    }}, false);

    this.host = this.prefs.getCharPref("host");

    this.port = this.prefs.getIntPref("port");

    this.__proto__.__proto__.connect.call(this);
};

LivereloadBackgroundFirefox.prototype.sendPageUrl = function() {
    var activeTab = this.lastPage;
    if (activeTab == null) {
        throw 'No active tab';
    }
    var socket = this.socket;
    this.socket.send(activeTab.linkedBrowser.contentDocument.location.href);
};

LivereloadBackgroundFirefox.prototype.onEnablePage = function(tabId) {
    this.icon.src = 'chrome://livereload/skin/icon_16-on.png';
    this.icon.setAttribute('tooltiptext', 'Disable LiveReload');
};

LivereloadBackgroundFirefox.prototype.onDisablePage = function(tabId) {
    this.icon.src = 'chrome://livereload/skin/icon_16-off.png';
    this.icon.setAttribute('tooltiptext', 'Enable LiveReload');
};


window.addEventListener('load', function() {

    var livereloadBackground = new LivereloadBackgroundFirefox;
    //@debug window.livereloadBackground = livereloadBackground;

    var icon = livereloadBackground.icon = document.getElementById('livereload-icon');

    icon.addEventListener('command', function(event) {
        livereloadBackground.togglePage(event.view.gBrowser.selectedTab);
    }, false);

    gBrowser.tabContainer.addEventListener('TabSelect', function(event) {
        var tab = event.target;
        var index = livereloadBackground.pages.indexOf(tab);
        if (index == -1) {
            livereloadBackground.onDisablePage(tab);
        } else {
            livereloadBackground.onEnablePage(tab);
        }
    }, false);

    gBrowser.tabContainer.addEventListener('TabClose', function(event) {
        var tab = event.target;
        if (tab) {
            livereloadBackground.disablePage(tab);
        } else {
            throw 'no contentWindow';
        }
    }, false);

}, false);
