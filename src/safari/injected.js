var livereload = new LivereloadContent(document);
safari.self.addEventListener('message', function(event) {
    if (event.name == 'LiveReload') {
        livereload.reload(event.message);
    }
}, false);
