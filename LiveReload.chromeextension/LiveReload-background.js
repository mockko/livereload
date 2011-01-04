
// LiveReload-enabled tabs
var tabs = [];
tabs.add = function(id){
    var index = this.indexOf(id);
    return index == -1 ? this.push(id) : index;
};
tabs.__defineGetter__('last', function(){
    var length = this.length;
    return length ? this[length - 1] : null;
});

var ws = null;
var disconnectionReason = 'unexpected';
var api_version = "1.5";
var versionInfoReceived = false;
// localhost does not work on Linux b/c of http://code.google.com/p/chromium/issues/detail?id=36652,
// 0.0.0.0 does not work on Windows
var host = (navigator.appVersion.indexOf("Linux") >= 0 ? "0.0.0.0" : "localhost");

function establishConnection() {
    if (ws) {
        throw 'WebSocket already opened';
    }
    ws = new WebSocket("ws://" + host + ":35729/websocket");
    disconnectionReason = 'cannot-connect';
    versionInfoReceived = false;
    ws.onmessage = function(evt) {
        if (tabs.length == 0) {
            throw 'No tabs';
        }
        var m, data = evt.data;
        if (m = data.match(/!!ver:([\d.]+)/)) {
            versionInfoReceived = true;
            if (m[1] != api_version) {
                if (api_version > m[1]) {
                    alert("You need to update the command-line tool to continue using LiveReload.\n\n" +
                        "Extension version: " + api_version + "\n" +
                        "Command-line tool version: " + m[1] + "\n\n" +
                        "Please run the following command to update your command-line tool:\n" +
                        "    gem update livereload");
                } else {
                    alert("You need to update the browser extension to continue using LiveReload.\n\n" +
                        "Extension version: " + api_version + "\n" +
                        "Command-line tool version: " + m[1] + "\n\n" +
                        "Please go to the extensions manager and check for updates.");
                }
                disconnectionReason = 'version-mismatch';
                ws.close();
                deactivated();
            }
            return;
        } else if (!versionInfoReceived) {
            alert("You are using an old incompatible version of the command-line tool.\n\n" +
                "Please run the following command to update your command-line tool:\n" +
                "    gem update livereload");
            disconnectionReason = 'version-mismatch';
            ws.close();
            deactivated();
            return;
        }
        tabs.forEach(function(tabId){
            chrome.tabs.sendRequest(tabId, data);
        });
    };
    ws.onclose = function() {
        if (disconnectionReason == 'cannot-connect') {
            alert("Cannot connect to LiveReload server. Please update livereload gem to 1.5 (if you haven't already) and run livereload command from the directory you want to watch.");
        }
        deactivated();
    };
    ws.onopen = function() {
        disconnectionReason = 'broken';
        sendTabUrl();
    };
}

function sendTabUrl() {
    var activeTab = tabs.last;
    if (activeTab == null) {
        throw 'No active tab';
    }
    chrome.tabs.get(activeTab, function(tab) {
        ws && ws.send(tab.url);
    });
}

function closeConnection() {
    if (ws) {
        disconnectionReason = 'manual';
        ws.close();
    }
    deactivated();
}

function iconActivated() {
    chrome.browserAction.setTitle({ title: "Disable LiveReload" });
    chrome.browserAction.setIcon({ path: 'icon19-on.png' });
}

function iconDeactivated() {
    chrome.browserAction.setTitle({ title: "Enable LiveReload" });
    chrome.browserAction.setIcon({ path: 'icon19.png' });
}

function activated() {
    iconActivated();
}

function deactivated() {
    ws = null;
    tabs.length = 0;
    versionInfoReceived = false;
    iconDeactivated();
}

chrome.browserAction.onClicked.addListener(function(tab) {
    var tabId = tab.id;
    var index = tabs.indexOf(tabId);
    if (index > -1) {
        tabs.splice(index, 1);
        //TODO: log on the server about disconected pages
        if (tabs.length == 0) {
            closeConnection();
        } else {
            iconDeactivated();
        }
    } else {
        tabs.add(tabId);
        if (ws && ws.readyState == 1) {
            sendTabUrl();
        } else {
            try {
                establishConnection();
            } catch(e) {
                alert('Failed to establish connection: ' + e.message);
                return;
            }
        }
        activated();
    }
}, false);

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
    if (tabs.indexOf(tabId) > -1) {
        iconActivated();
    } else {
        iconDeactivated();
    }
}, false);
