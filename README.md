LiveReload: xrefresh for Safari & Chrome
========================================

LiveReload is a Safari/Chrome extension + a command-line tool that:

1. Applies CSS and JavaScript file changes without reloading a page.
2. Automatically reloads a page when any other file changes (html, image, server-side script, etc).


What's new?
-----------

1.2: added Chrome extension, added icon artwork, added a check that the command-line tool version is compatible with the extension version, fixed a bug with multiple stylesheet updates happening too fast.

1.1: enabled autoupdating for the Safari extension.

1.0: original release -- Safari extension and a command-line tool in a Ruby gem.


Installing in Safari
--------------------

1. You need Ruby installed. Mac OS X users already have it, Windows users get it from [ruby-lang.org](http://www.ruby-lang.org/en/downloads/).

2. Install the command-line tool:

        sudo gem install livereload

3. If you haven't already, [you need to enable Safari extensions](http://safariextensions.tumblr.com/post/680219521/post-how-to-enable-extensions-06-09-10).

4. Download [LiveReload 1.2 extension](http://github.com/downloads/mockko/livereload/LiveReload-1.2.safariextz). Double-click it and confirm installation:

![](http://github.com/mockko/livereload/raw/master/docs/images/safari-install-prompt.png)


Installing in Chrome
--------------------

1. You need Ruby installed. Mac OS X users already have it, Windows users get it from [ruby-lang.org](http://www.ruby-lang.org/en/downloads/).

2. Install the command-line tool:

        sudo gem install livereload

3. Visit the [LiveReload page](https://chrome.google.com/extensions/detail/jnihajbhpnppcggbcgedagnkighmdlei) on Chrome Extension Gallery and click Install. Confirm the installation:

![](http://github.com/mockko/livereload/raw/master/docs/images/chrome-install-prompt.png)

Done. Now you have an additional button on your toolbar:

![](http://github.com/mockko/livereload/raw/master/docs/images/chrome-button.png)


Usage
-----

Run the server in the directory you want to watch:

    % livereload
    
You should see something like this:

![](http://github.com/mockko/livereload/raw/master/docs/images/livereload-server-running.png)

Now, if you are using Safari, right-click the page you want to be livereload'ed and choose “Enable LiveReload”:

![](http://github.com/mockko/livereload/raw/master/docs/images/safari-context-menu.png)

If you are using Chrome, just click the toolbar button (it will turn green to indicate that LiveReload is active).


Limitations
-----------

Note that you can only have one page monitored, so if you enable LiveReload on another page, the first one will stop reloading.

LiveReload does not work with local files in Chrome (since accessing file:// URLs from an extension requires an approval from the Google Chrome team) and in Safari (since we haven't bothered fixing it yet).


License
-------

This software is distributed under the MIT license.


Thanks
------

LiveReload has been greatly inspired by (and actually borrows a few lines of code from) [XRefresh](http://xrefresh.binaryage.com/), a similar tool for Firefox.
