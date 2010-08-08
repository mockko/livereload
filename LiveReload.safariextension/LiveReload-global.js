
var activeTab = null;
var ws = null;
var disconnectionReason = 'unexpected';
var api_version = "1.3";
var versionInfoReceived = false;

function establishConnection() {
    if (ws != null) return;
    ws = new WebSocket("ws://localhost:35729/websocket");
    disconnectionReason = 'cannot-connect';
    versionInfoReceived = false;
    ws.onmessage = function(evt) {
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
        activeTab.page.dispatchMessage("LiveReload", data);
    };
    ws.onclose = function() {
        if (disconnectionReason == 'cannot-connect') {
            alert("Cannot connect to LiveReload server. Please update livereload gem to 1.4 (if you haven't already) and run livereload command from the directory you want to watch.");
        } else if (disconnectionReason == 'broken') {
            alert("LiveReload server connection closed. Please restart the server and re-enable LiveReload.");
        }
        deactivated();
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
    }
    deactivated();
}

function deactivated() {
    ws = null;
    activeTab = null;
    versionInfoReceived = false;
}

safari.application.addEventListener("command", function(event) {
    if (event.command == 'enable') {
        var tab = safari.application.activeBrowserWindow.activeTab;
        if (activeTab == tab) {
            closeConnection();
        } else {
            var wasActive = (activeTab != null);
            try {
                establishConnection();
            } catch(e) {
                alert("Failed to establish connection: " + e.message);
                deactivated();
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
