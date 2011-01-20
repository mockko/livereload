var livereload = new LivereloadContent(document);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    livereload.log('LiveReload: ' + request);
    livereload.reload(request);
});
