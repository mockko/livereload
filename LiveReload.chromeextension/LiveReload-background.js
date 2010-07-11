
var activeTabId = null;
var ws = null;
var disconnectionReason = 'unexpected';

function establishConnection() {
    if (ws != null) return;
    ws = new WebSocket("ws://localhost:10083/websocket");
    disconnectionReason = 'cannot-connect';
    ws.onmessage = function(evt) {
        if (activeTabId == null) return;
        chrome.tabs.sendRequest(activeTabId, evt.data);
    };
    ws.onclose = function() {
        if (disconnectionReason == 'cannot-connect') {
            alert("Cannot connect to LiveReload server. Please run livereload command from the directory you want to watch.");
        } else if (disconnectionReason == 'broken') {
            alert("LiveReload server connection closed. Please restart the server and re-enable LiveReload.");
        }
        activeTabId = null;
        ws = null;
    };
    ws.onopen = function() {
        disconnectionReason = 'broken';
        if (activeTabId != null)
            sendTabUrl();
    };
}

function sendTabUrl() {
    chrome.tabs.get(activeTabId, function(tab) {
        if (ws != null)
            ws.send(tab.url);
    });
}

function closeConnection() {
    if (ws != null) {
        disconnectionReason = 'manual';
        ws.close();
        ws = null;
    }
}

chrome.browserAction.onClicked.addListener(function(tab) {
    var tabId = tab.id;
    if (activeTabId == tabId) {
        closeConnection();
        activeTabId = null;
        chrome.browserAction.setTitle({ title: "Enable LiveReload" });
    } else {
        var wasActive = (activeTabId != null);
        try {
            establishConnection();
        } catch(e) {
            alert("Failed to establish connection: " + e.message);
            activeTabId = null;
            return;
        }
        activeTabId = tabId;
        if (wasActive)
            sendTabUrl();
        chrome.browserAction.setTitle({ title: "Disable LiveReload" });
    }
}, false);
