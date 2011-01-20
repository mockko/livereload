var livereload = {};

livereload.client = new LivereloadContent(document);

livereload.background = new LivereloadBackground(function reloadDocument(doc, data) {
    livereload.client.reload(data);
});

livereload.run = function() {
    livereload.background.enablePage(document);
};

