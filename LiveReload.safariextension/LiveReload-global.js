
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

function Version(version){
    var triple = version.split('.').map(function(n){
        return parseInt(n);
    });
    this.triple = triple;
    this.asFloat = parseFloat(triple[0] + '.' + triple[1]);
}
Version.prototype = {
    toString: function(){
        return this.triple.join('.');
    }
};
var api_version = new Version('1.5.1');
var versionInfoReceived = false;
// localhost does not work on Linux b/c of http://code.google.com/p/chromium/issues/detail?id=36652,
// 0.0.0.0 does not work on Windows
var host = (navigator.appVersion.indexOf("Linux") >= 0 ? "0.0.0.0" : "localhost");
var port = '35729';
var uri = 'ws://' + host + ':' + port + '/websocket';


/**
 * @param {string} data
 * @return {boolean} true on succes, false on error
 */
function checkVersion(data) {
    var m = data.match(/!!ver:([\d.]+)/);
    if (m) {
        var serverVersion = new Version(m[1]).asFloat;
        // Compare only major and minor versions. Do not compare patch version.
        if (serverVersion == api_version.asFloat) {
            return true;
        } else {
            if (serverVersion > api_version.asFloat) {
                alert('You need to update the command-line tool to continue using LiveReload.\n\n'
                    + 'Extension version: ' + api_version + '\n'
                    + 'Command-line tool version: ' + m[1] + '\n\n'
                    + 'Please run the following command to update your command-line tool:\n'
                    + '    gem update livereload');
            } else {
                alert('You need to update the browser extension to continue using LiveReload.\n\n' + 'Extension version: ' + api_version + '\n' + 'Command-line tool version: ' + m[1] + '\n\n' + 'Please go to the extensions manager and check for updates.');
            }
        }
    } else {
        alert('You are using an old incompatible version of the command-line tool.\n\n'
            + 'Please run the following command to update your command-line tool:\n'
            + '    gem update livereload');
    }
    return false;
}


function establishConnection() {
    if (ws) {
        throw 'WebSocket already opened.';
    }
    ws = new WebSocket(uri);
    disconnectionReason = 'cannot-connect';
    versionInfoReceived = false;
    ws.onmessage = function(evt) {
        if (tabs.length == 0) {
            throw 'No tabs';
        }
        var data = evt.data;
        if (!versionInfoReceived) {
            if (checkVersion(data)) {
                versionInfoReceived = true;
            } else {
                disconnectionReason = 'version-mismatch';
                ws.close();
                deactivated();
            }
        } else {
            killZombies();
            tabs.forEach(function(tab){
                tab.page.dispatchMessage('LiveReload', data);
            });
        }
    };
    ws.onclose = function() {
        if (disconnectionReason == 'cannot-connect') {
            alert('Cannot connect to LiveReload server:\n' + uri);
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
    ws && ws.send(activeTab.url);
}

function closeConnection() {
    if (ws) {
        disconnectionReason = 'manual';
        ws.close();
    }
    deactivated();
}

function deactivated() {
    ws = null;
    tabs.length = 0;
    versionInfoReceived = false;
}

// http://stackoverflow.com/questions/4587500/catching-close-tab-event-in-a-safari-extension
function killZombies(){
    for (var i = tabs.length; i--;) {
        if (!tabs[i].url) {
            tabs.splice(i, 1);
        }
    }
}

safari.application.addEventListener("command", function(event) {
    if (event.command == 'enable') {
        killZombies();

        var tab = safari.application.activeBrowserWindow.activeTab;
        var index = tabs.indexOf(tab);
        if (index > -1) {
            tabs.splice(index, 1);
            //TODO: log on the server about disconected pages
            if (tabs.length == 0) {
                closeConnection();
            }
        } else {
            tabs.add(tab);
            if (ws && ws.readyState == 1) {
                sendTabUrl();
            } else {
                try {
                    establishConnection();
                } catch(e) {
                    alert('Failed to establish connection: ' + e.message);
                    deactivated();
                    return;
                }
            }
        }
    }
}, false);

safari.application.addEventListener("validate", function(event) {
    var tab = safari.application.activeBrowserWindow.activeTab;
    event.target.title = tabs.indexOf(tab) == -1 ?
        'Enable LiveReload' :
        'Disable LiveReload';
}, false);
