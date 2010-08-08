LiveReload: xrefresh for Safari & Chrome
========================================

LiveReload is a Safari/Chrome extension + a command-line tool that:

1. Applies CSS and JavaScript file changes without reloading a page.
2. Automatically reloads a page when any other file changes (html, image, server-side script, etc).

![](http://github.com/mockko/livereload/raw/master/artwork/screenshot.png)

**Please help spread the word — tweet or blog about LiveReload!**

Watch an [awesome screencast by Gregg Pollack](http://blog.envylabs.com/2010/07/livereload-screencast/) at envylabs.com.

**What do our users say?**

“I think LiveReload is going to change the way I work...” [@mheerema](http://twitter.com/mheerema/status/18363670011)

“spent a day using livereload. really impressed, very nice to watch pages update as I add / change code.” [@pollingj](http://twitter.com/pollingj/status/18366550224)

“Gem of the month (quarter?): LiveReload” [@grimen](http://twitter.com/grimen/status/18369684099)


What's new?
-----------

Want to know about latest developments and smart tricks? Follow [@livereload](http://twitter.com/livereload) on Twitter!

Feel like chatting? Join us at livereload@jaconda.im — just add this contact to your Jabber / Google Talk. (Please don't overuse this chat feature, we're trying to get some work done too!)

1.4: Works on Windows. Sane file system monitoring (had to write it from scratch, see em-dir-watcher gem). Port number changed to 35729 because of a conflict with Zend Server. Added grace period to combine the changes made in rapid succession. Works with Vim.

**Please help spread the word — tweet or blog about LiveReload!**

1.3: Configuration file (`.livereload`) — you can customize extensions, configure exclusions, disable no-reload refreshing. Monitoring of multiple folders. Some bugs fixed.

1.2.2: add .erb to the list of monitored extensions (this is a gem-only update, run `gem update livereload` to install).

1.2.1: added workaround for Chrome bug (unable to open WebSocket to localhost), fixed problem with command-line tool trying to use kqueue on Linux.

1.2: added Chrome extension, added icon artwork, added a check that the command-line tool version is compatible with the extension version, fixed a bug with multiple stylesheet updates happening too fast.

1.1: enabled autoupdating for the Safari extension.

1.0: original release -- Safari extension and a command-line tool in a Ruby gem.


Installing in Safari
--------------------

1. You need Ruby installed. Mac OS X users already have it, Windows users get it from [ruby-lang.org](http://www.ruby-lang.org/en/downloads/).

2. Install the command-line tool. On OS X:

        sudo gem update --system
        sudo gem install livereload

    on Linux:

        sudo gem update --system
        sudo gem install rb-inotify livereload

    on Windows:

        gem update --system
        gem install eventmachine --platform=win32
        gem install win32-changenotify livereload

3. If you haven't already, [you need to enable Safari extensions](http://safariextensions.tumblr.com/post/680219521/post-how-to-enable-extensions-06-09-10).

4. Download [LiveReload 1.4 extension](http://github.com/downloads/mockko/livereload/LiveReload-1.4.safariextz). Double-click it and confirm installation:

![](http://github.com/mockko/livereload/raw/master/docs/images/safari-install-prompt.png)


Installing in Chrome
--------------------

1. You need Ruby installed. Mac OS X users already have it, Windows users get it from [ruby-lang.org](http://www.ruby-lang.org/en/downloads/).

2. Install the command-line tool. On OS X and Linux:

        sudo gem update --system
        sudo gem install livereload

    on Linux:

        sudo gem update --system
        sudo gem install rb-inotify livereload

    on Windows:

        gem update --system
        gem install eventmachine --platform=win32
        gem install win32-changenotify livereload

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


Advanced Usage
--------------

If you want to monitor several directories, pass them on the command line:

    % livereload /some/dir /another/dir /one/more/dir

(in this case it does not matter which directory you run `livereload` from)

Run `livereload --help` for a list of command-line options (there's nothing interesting there, though).

Looking to also process CoffeeScript, SASS, LessCSS or HAML? Here's a [Rakefile that does that live too](http://gist.github.com/472349). (Please read the comments if you're using HAML for templates in a Rails app.)


Configuration
-------------

To:

* exclude some directories or files from monitoring

* monitor additional extensions (like `.haml`, if you're serving HAML directly from Rails without generating `.html` on disk)

* reload the whole page when `.js` changes instead of applying the changes live

...you need to edit `.livereload` file in the monitored folder. (This file is automatically created if it does not exist when you run `livereload`.)

Syntax is like this:

    # Lines starting with pound sign (#) are ignored.

    # additional extensions to monitor
    config.exts << 'haml'

    # exclude files with NAMES matching this mask
    config.exclusions << '~*'
    # exclude files with PATHS matching this mask (if the mask contains a slash)
    config.exclusions << '/excluded_dir/*'
    # exclude files with PATHS matching this REGEXP
    config.exclusions << /somedir.*(ab){2,4}.(css|js)$/

    # reload the whole page when .js changes
    config.apply_js_live = false
    # reload the whole page when .css changes
    config.apply_css_live = false

    # wait 50ms for more changes before reloading a page
    #config.grace_period = 0.05

Configuration changes are applied live (it is called *Live* Reload after all, that has to mean something).

A global config file (`~/.livereload`) is also supported if you happen to need one. It is merged with per-folder configurations.


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
