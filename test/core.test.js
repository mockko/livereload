test("generateNextUrl", function(){
    var url = generateNextUrl("../icons/browsers.svg?size=100x100#chrome");

    equal(url.after("#"), "chrome");

    var param = url.before("#").after("?");
    ok(/size=100x100&livereload=\d+/.test(param), "new livereload param must be appended");

    equal(url.before("?"), "../icons/browsers.svg");


    var styleUrl = "http://example.com/style.css?livereload=1293305882505";
    url = generateNextUrl(styleUrl);
    ok(url != styleUrl, "livereload param must be updated");
    ok(/http[:][/][/]example[.]com[/]style[.]css[?]livereload=\d+/.test(url));

});

test("reloadStylesheetImages", function(){
    var link = appendStyleSheet('fixtures/images.css');
    var lastStylesheet = document.styleSheets[document.styleSheets.length - 1];
    if (lastStylesheet.cssRules) {
        var result = reloadStylesheetImages(lastStylesheet, 'icon19-on.png', generateExpando());
        equal(result.length, 2);
        equal(result[0].style.backgroundImage, result[1].style.backgroundImage);
    } else {
        // Chrome can't run this test from file://
    }
});
