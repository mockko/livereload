WebSocket Protocol Details
==========================


API (aka protocol) version 1.2 is extremely simple.


Handshake
---------

After the connection is initiated, the server immediately sends API version info to the browser:

    !!ver:1.2

If the browser is okay to speak this API version, it does nothing. If the browser does not support this version, it closes the connection.


File Modified
-------------

When a file is modified, the name (without a path) is sent to the browser:

    myfile.css


URL Change
----------

The browser sometimes sends the URL of the current page back to the server. It is printed on the console and serves purely informational purposes (to give the user some confidence that things are working the way (s)he expects).

    http://example.com/example/path/
