LiveReload: xrefresh for Safari
===============================

LiveReload is a Safari extension + a command-line tool that:

1. Applies CSS and JavaScript file changes without reloading a page.
2. Automatically reloads a page when any other file changes (html, image, server-side script, etc).


Installing
----------

1. Install the command-line tool:

        sudo gem install livereload

2. If you haven't already, [you need to enable Safari extensions](http://safariextensions.tumblr.com/post/680219521/post-how-to-enable-extensions-06-09-10).

3. Download [LiveReload 1.0 extension](http://github.com/downloads/mockko/livereload/LiveReload-1.0.safariextz). Double-click it, and Safari will prompt to install it:

![](http://github.com/mockko/livereload/raw/master/docs/images/safari-install-prompt.png)


Usage
-----

Run the server in the directory you want to watch:

    % livereload
    
You should see something like this:

![](http://github.com/mockko/livereload/raw/master/docs/images/livereload-server-running.png)

Now go to Safari, right-click the page you want to be livereload'ed and choose “Enable LiveReload”:

![](http://github.com/mockko/livereload/raw/master/docs/images/safari-context-menu.png)

Presto!

Note that you can only have one page monitored, so if you enable LiveReload on another page, the first one will stop reloading.


License
-------

This software is distributed under the MIT license.
