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
