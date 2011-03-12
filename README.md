# LiveReload

![LR](https://github.com/mockko/livereload/raw/master/artwork/screenshot.png)

LiveReload is a Safari/Chrome extension + a command-line tool that:

1. Applies CSS and JavaScript file changes without reloading a page.
2. Automatically reloads a page when any other file changes (html, image, server-side script, etc).

**[Screencast](http://blog.envylabs.com/2010/07/livereload-screencast/)** by Gregg Pollack at envylabs.com.


## What's new?

1.6: Configurable host & port, no-extension pure-html/js cross-browser version (see `example/xbrowser.html`, more docs coming soon), many small bug fixes.

1.5: Support for `file://` URLs in Chrome (does not seem possible in Safari, sorry). JS live reloading is now off by default. Minor UI improvements.

1.4: Works on Windows. Sane file system monitoring (had to write it from scratch, see em-dir-watcher gem). Port number changed to 35729 because of a conflict with Zend Server. Added grace period to combine the changes made in rapid succession. Works with Vim.

1.3: Configuration file (`.livereload`) — you can customize extensions, configure exclusions, disable no-reload refreshing. Monitoring of multiple folders. Some bugs fixed.

1.2.2: add .erb to the list of monitored extensions (this is a gem-only update, run `gem update livereload` to install).

1.2.1: added workaround for Chrome bug (unable to open WebSocket to localhost), fixed problem with command-line tool trying to use kqueue on Linux.

1.2: added Chrome extension, added icon artwork, added a check that the command-line tool version is compatible with the extension version, fixed a bug with multiple stylesheet updates happening too fast.

1.1: enabled autoupdating for the Safari extension.

1.0: original release -- Safari extension and a command-line tool in a Ruby gem.


## Installation

LiveReload consists of command-line monitoring tool (livereload ruby gem) and browser extensions (for Google Chrome and Safari).


### Monitoring tool

#### Windows

1. Install Ruby from [rubyinstaller.org/downloads](http://rubyinstaller.org/downloads/). LiveReload has been tested on Ruby 1.9.1 and 1.8.7.

2. Download Ruby Development Kit from the same page and follow [instructions](https://github.com/oneclick/rubyinstaller/wiki/Development-Kit).

3. `gem install eventmachine-win32 win32-changenotify win32-event livereload --platform=ruby`


#### Mac OS X

1. Mac OS X ships with Ruby installed.

2. You need Xcode tools installed to compile eventmachine gem. Get it from [developer.apple.com](http://developer.apple.com/technologies/tools/xcode.html).

3. Install [RubyCocoa](http://sourceforge.net/projects/rubycocoa/).

4. `sudo gem install livereload`


#### Linux

`sudo gem install rb-inotify livereload`


Another option is to use [Guard](https://github.com/guard/guard) with [guard-livereload](https://github.com/guard/guard-livereload). It does not require RubyCocoa on Mac OS X.


### [Google Chrome extension](https://chrome.google.com/extensions/detail/jnihajbhpnppcggbcgedagnkighmdlei)

![](https://github.com/mockko/livereload/raw/master/docs/images/chrome-install-prompt.png)

Click “Install”. Actually, LiveReload does not access your browser history. The warning is misleading.

![](https://github.com/mockko/livereload/raw/master/docs/images/chrome-button.png)


### Safari extension

Download [LiveReload 1.6.1 extension](https://github.com/downloads/mockko/livereload/LiveReload-1.6.1.safariextz). Double-click it and confirm installation:

![](https://github.com/mockko/livereload/raw/master/docs/images/safari-install-prompt.png)


### [Firefox 4 extension](https://addons.mozilla.org/firefox/addon/livereload/)

![](https://static.addons.mozilla.net/img/uploads/previews/full/53/53026.png)


## Usage

Run the server in the directory you want to watch:

    % livereload
    
You should see something like this:

![](https://github.com/mockko/livereload/raw/master/docs/images/livereload-server-running.png)

Now, if you are using Safari, right-click the page you want to be livereload'ed and choose “Enable LiveReload”:

![](https://github.com/mockko/livereload/raw/master/docs/images/safari-context-menu.png)

If you are using Chrome, just click the toolbar button (it will turn green to indicate that LiveReload is active).


### Advanced Usage

If you want to monitor several directories, pass them on the command line:

    % livereload /some/dir /another/dir /one/more/dir

(in this case it does not matter which directory you run `livereload` from)

Run `livereload --help` for a list of command-line options (there's nothing interesting there, though).

Looking to also process CoffeeScript, SASS, LessCSS or HAML? Here's a [Rakefile that does that live too](http://gist.github.com/472349). (Please read the comments if you're using HAML for templates in a Rails app.)


### Configuration

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


## Limitations

LiveReload does not work with local files in Safari.

## Spread the word

[@livereload](http://twitter.com/livereload) on Twitter!

###What do our users say?

“I think LiveReload is going to change the way I work...” [@mheerema](http://twitter.com/mheerema/status/18363670011)

“spent a day using livereload. really impressed, very nice to watch pages update as I add / change code.” [@pollingj](http://twitter.com/pollingj/status/18366550224)

“Gem of the month (quarter?): LiveReload” [@grimen](http://twitter.com/grimen/status/18369684099)

Feel like chatting? Join us at livereload@jaconda.im — just add this contact to your Jabber / Google Talk.


## License

This software is distributed under the MIT license.


## Thanks

LiveReload has been greatly inspired by (and actually borrows a few lines of code from) [XRefresh](http://xrefresh.binaryage.com/), a similar tool for Firefox.
