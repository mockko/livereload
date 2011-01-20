var livereload = new LivereloadContent(document);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    console.log('LiveReload: ' + request);
    livereload.reload(request);
});
