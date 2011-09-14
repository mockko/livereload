Version Numbers
===============


**Safari extension version:**

* `LiveReload.safariextension/Info.plist`:

        <key>CFBundleShortVersionString</key>
        <string>1.2</string>
        <key>CFBundleVersion</key>
        <string>1.2</string>

* `LiveReload-update.plist` (autoupdate manifest used by Safari to check for updates — loaded right from master branch on GitHub):

        <key>CFBundleVersion</key>
        <string>1.2</string>
        <key>CFBundleShortVersionString</key>
        <string>1.2</string>
        <key>URL</key>
        <string>http://github.com/downloads/mockko/livereload/LiveReload-1.2.safariextz</string>

    (3 occurrences — note the last one in URL)


**Chrome extension version:**

* `LiveReload.chromeextension/manifest.json`:

        "version": "1.2.1",


**Gem version** (used by gem command to check for updates):

* `server/livereload.gemspec`:

        `s.version = "1.2.1"`

* `Rakefile`:

        `LIVERELOAD_VERSION = '1.2.1'`


**API version** (shared by the Gem and extensions):

* `LiveReload.chromeextension/LiveReload-background.js`:

        var version = "1.2";

* `LiveReload.safariextension/LiveReload-global.js`:

        var version = "1.2";

* `server/lib/livereload.rb`:

        VERSION = "1.2"
