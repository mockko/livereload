WebSocket Protocol Details
==========================


API versions 1.3–1.5 use JSON in the server-to-browser direction.

API version 1.2 was an extremely simple one.


Handshake
---------

After the connection is initiated, the server immediately sends API version info to the browser:

    !!ver:1.5

If the browser is okay to speak this API version, it does nothing. If the browser does not support this version, it closes the connection.


JSON command format
-------------------

General format of a JSON command is:

["command_name", args]


File Modified
-------------

When a file is modified, the full path is sent to the browser as a “refresh” command:

    ["refresh", { "path": "/some/path/myfile.css", "apply_js_live": true, "apply_css_live": true }]

`path` is required; `apply_js_live` and `apply_css_live` are optional.


URL Change
----------

The browser sometimes sends the URL of the current page back to the server. It is printed on the console and serves purely informational purposes (to give the user some confidence that things are working the way (s)he expects).

    http://example.com/example/path/
