function LivereloadBackgroundChrome() {}
LivereloadBackgroundChrome.prototype = new LivereloadBackground(function reloadPage(tabId, data) {
    chrome.tabs.sendRequest(tabId, data);
});

LivereloadBackgroundChrome.prototype.updateSettings = function () {
    this.disconnect();
};

LivereloadBackgroundChrome.prototype.connect = function () {
    if (localStorage['host']) this.host = localStorage['host'];
    else this.host = this.__proto__.__proto__.host;

    if (localStorage['port']) this.port = localStorage['port'];
    else this.port = this.__proto__.__proto__.port;

    this.__proto__.__proto__.connect.call(this);
};

LivereloadBackgroundChrome.prototype.sendPageUrl = function() {
    var activeTab = this.lastPage;
    if (activeTab == null) {
        throw 'No active tab';
    }
    var socket = this.socket;
    chrome.tabs.get(activeTab, function(tab) {
        socket.send(tab.url);
    });
};

LivereloadBackgroundChrome.prototype.onEnablePage = function(tabId) {
    chrome.browserAction.setTitle({title: 'Disable LiveReload'});
    chrome.browserAction.setIcon({path: 'icon19-on.png'});
};

LivereloadBackgroundChrome.prototype.onDisablePage = function(tabId) {
    chrome.browserAction.setTitle({title: 'Enable LiveReload'});
    chrome.browserAction.setIcon({path: 'icon19.png'});
};


var livereload = new LivereloadBackgroundChrome;

chrome.browserAction.onClicked.addListener(function(tab) {
    livereload.togglePage(tab.id);
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
    if (livereload.pages.indexOf(tabId) > -1) {
        livereload.onEnablePage(tabId);
    } else {
        livereload.onDisablePage(tabId);
    }
}, false);

chrome.tabs.onRemoved.addListener(function(tabId) {
    livereload.disablePage(tabId);
});
