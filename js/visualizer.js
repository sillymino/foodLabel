function start() {

    // I18N
    if (TASK.lang === "zh-simp" || TASK.lang === "zh-trad") {
        $('body').addClass('zh');
    }
    _T = _T[TASK.lang] || _T['en'];

    function createSentenceDiv(query, answer) {
        var sentenceP = $("<div>");
        query.forEach(function (word, index) {
            var wordSpan = $("<span class='wordSpan'>")
                .text(word).appendTo(sentenceP);
            if (answer[index]) {
                wordSpan.addClass("c" + answer[index].toString(36));
            }
            sentenceP.append(" ");
        });
        $("<div class='clearFix'>").appendTo(sentenceP);
        return sentenceP;
    }

    // Load and display categories
    TASK.cats.forEach(function (word, index) {
        $("#cats").append(
            $("<span>").addClass("visualizer-category")
                .addClass("c" + index.toString(36)).text(word)
        ).append("<br>");
    });
    
    /* Display Mode 1: Grouped by Worker (default)
       File Format:
       [{"workerid": "ABCD123456789",
         "samples": [["this is sentence one",
                      "0002",                    <-- the worker's work
                      "0012", "0003", "0002"],   <-- some other workers' work
                     ["and this is sentence two",
                      "10002",
                      "00012", "10003"]]]},      <-- different no. of samples is ok
        ...]
     */
    function displayByWorker(data) {
        data.forEach(function (worker) {
            var personDiv = $("<div>").appendTo('#showarea')
                .append("<h1>" + worker.workerid + "</h1>");
            worker.samples.forEach(function (sample) {
                var query;
                sample.forEach(function (s, index) {
                    if (index === 0) {
                        query = s.split(_T.wordSeparator);
                    } else {
                        var ds = createSentenceDiv(query, s).appendTo(personDiv);
                        if (index === 1) {
                            ds.addClass("uguu");
                        }
                    }
                });
            });
        });
    }

    /* Display Mode 2: Grouped by Sentence
       File Format:
       [["this is sentence one",
         [["ABCD000000001", "0002"],
          ["ABCD000000002", "0012"],
          ["ABCD000000003", "0003"],
          ["ABCD000000004", "0002"]]],
        ["and this is sentence two",
         [["ABCD000000001", "10002"],
          ["ABCD000000005", "00012"],
          ["ABCD000000007", "00013"]]],
        ...]
    */
    function displayBySentence(data) {
        data.forEach(function (question, index) {
            if (!question[0]) return;
            var sentenceDiv = $("<div>").appendTo('#showarea')
                .append($("<h1>").text(question[0]));
            var query = question[0].split(_T.wordSeparator);
            question[1].forEach(function (person) {
                var personDiv = $("<div>").appendTo(sentenceDiv);
                personDiv.append(person[0])
                    .append(createSentenceDiv(query, person[1]));
                $("<div class='clearFix'>").appendTo(sentenceDiv);
            });
        });
        
    }

    // Load JSON file to display
    if (gup("file")) {
        var filename = gup("file");
        $.getJSON(filename, gup("sentence") ? displayBySentence : displayByWorker)
            .fail(function () {
                $("#showarea").append(
                    $("<p class=centerize>ERROR: File not found</p>"));
            });
    } else {
        $("#showarea").append(
            $("<p class=centerize>ERROR: Please specify the file" +
              " to display using the URL parameter ?file=FILENAME</p>"));
    }

};
