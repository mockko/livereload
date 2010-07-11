
var activeTab = null;
var ws = null;
var disconnectionReason = 'unexpected';

function establishConnection() {
    if (ws != null) return;
    ws = new WebSocket("ws://localhost:10083/websocket");
    disconnectionReason = 'cannot-connect';
    ws.onmessage = function(evt) {
        activeTab.page.dispatchMessage("LiveReload", evt.data);
    };
    ws.onclose = function() {
        if (disconnectionReason == 'cannot-connect') {
            alert("Cannot connect to LiveReload server. Please run livereload command from the directory you want to watch.");
        } else if (disconnectionReason == 'broken') {
            alert("LiveReload server connection closed. Please restart the server and re-enable LiveReload.");
        }
        activeTab = null;
        ws = null;
    };
    ws.onopen = function() {
        disconnectionReason = 'broken';
        if (activeTab != null)
            sendTabUrl();
    };
}

function sendTabUrl() {
    ws.send(activeTab.url);
}

function closeConnection() {
    if (ws != null) {
        disconnectionReason = 'manual';
        ws.close();
        ws = null;
    }
}

safari.application.addEventListener("command", function(event) {
    if (event.command == 'enable') {
        var tab = safari.application.activeBrowserWindow.activeTab;
        if (activeTab == tab) {
            closeConnection();
            activeTab = null;
        } else {
            var wasActive = (activeTab != null);
            try {
                establishConnection();
            } catch(e) {
                alert("Failed to establish connection: " + e.message);
                activeTab = null;
                return;
            }
            activeTab = tab;
            if (wasActive)
                sendTabUrl();
        }
    }
}, false);

safari.application.addEventListener("validate", function(event) {
    var title;
    var tab = safari.application.activeBrowserWindow.activeTab;
    if (activeTab == null)
        title = "Enable LiveReload";
    else if (activeTab == tab)
        title = "Disable LiveReload";
    else
        title = "Switch LiveReload to this page";
    event.target.title = title;
}, false);
