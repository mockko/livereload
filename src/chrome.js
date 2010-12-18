chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    console.log("LiveReload: " + request);
    performLiveReload(request)
});
