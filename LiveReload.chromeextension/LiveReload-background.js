
var activeTabId = null;
var ws = null;
var disconnectionReason = 'unexpected';
var version = "1.2";
var versionInfoReceived = false;
// localhost does not work on Linux b/c of http://code.google.com/p/chromium/issues/detail?id=36652,
// 0.0.0.0 does not work on Windows
var host = (navigator.appVersion.indexOf("Linux") >= 0 ? "0.0.0.0" : "localhost");

function establishConnection() {
    if (ws != null) return;
    ws = new WebSocket("ws://" + host + ":10083/websocket");
    disconnectionReason = 'cannot-connect';
    versionInfoReceived = false;
    ws.onmessage = function(evt) {
        if (activeTabId == null) return;
        var m, data = evt.data;
        if (m = data.match(/!!ver:([\d.]+)/)) {
            versionInfoReceived = true;
            if (m[1] != version) {
                alert("You are using an incompatible version of the command-line tool.\n\n" +
                    "Extension version: " + version + "\n" +
                    "Command-line tool version: " + m[1] + "\n\n" +
                    "Please run the following command to update your command-line tool:\n" +
                    "    gem update livereload");
                disconnectionReason = 'version-mismatch';
                ws.close();
                deactivated();
                return;
            }
        } else if (!versionInfoReceived) {
            alert("You are using an old incompatible version of the command-line tool.\n\n" +
                "Please run the following command to update your command-line tool:\n" +
                "    gem update livereload");
            disconnectionReason = 'version-mismatch';
            ws.close();
            deactivated();
            return;
        }
        chrome.tabs.sendRequest(activeTabId, data);
    };
    ws.onclose = function() {
        if (disconnectionReason == 'cannot-connect') {
            alert("Cannot connect to LiveReload server. Please run livereload command from the directory you want to watch.");
        } else if (disconnectionReason == 'broken') {
            alert("LiveReload server connection closed. Please restart the server and re-enable LiveReload.");
        }
        deactivated();
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
    deactivated();
}

function activated() {
    chrome.browserAction.setTitle({ title: "Disable LiveReload" });
    chrome.browserAction.setIcon({ path: 'icon19-on.png' });
}

function deactivated() {
    ws = null;
    activeTabId = null;
    chrome.browserAction.setTitle({ title: "Enable LiveReload" });
    chrome.browserAction.setIcon({ path: 'icon19.png' });
}

chrome.browserAction.onClicked.addListener(function(tab) {
    var tabId = tab.id;
    if (activeTabId == tabId) {
        closeConnection();
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
        activated();
    }
}, false);
