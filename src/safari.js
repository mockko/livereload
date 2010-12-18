safari.self.addEventListener("message", function(event) {
    if (event.name == 'LiveReload') {
        performLiveReload(event.message)
    }
}, false);
