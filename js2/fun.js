/*
	A bunch of useful functions
*/
var questionDivArray = [], currentQuestion = -1, savedQuestion = 0;

function showQuestion (index) {
	// hide the previous thing displayed in preperation for new thing to display
	$(".question").hide();

	if (index === -1) {
		// If the current question is the instructions page
		$("#questionsDiv").hide();
		$("#introDiv").show();
		savedQuestion = currentQuestion;
	} else if (index >= questionDivArray.length) {
		// If the current question is the last question
		$("#questionsDiv").hide();
		$("finalDiv").show();
		$("submitButton").prop("disabled",false);
	} else {
		// The current question is a question
		$("#finalDiv, #introDiv").hide();
		$("#questionsDiv").show();
		questionDivArray[index].show(); //show the question associated with the index
		$("#questionNum").text((index+1) + " / " + questionDivArray.length);
	}

	currentQuestion = index; // Set the current question equal to the index value

	// If the index is the last question, make the "Next" button display "Finish" instead
	$("#nextButton").text(index === questionDivArray.length-1 ? _T["Finish!"] : _T["Next >"]);
};

function getCurrentQuestionDiv() {
	return questionDivArray[currentQuestion];
};

function parseXML(data) {
	data = $(data);
	function get(name, node) {
		return (node ? $(node) : data).find(name).text();
	};

	// Replace instructions
	$("#innerInstructionsUpper").empty();
	data.find("instructions").children().each(function(index,child) {
		$("#innerInstructionsUpper").append(child.innerHTML);
		$("#innerInstructionsUpper").append("<br><br>");
	});

	// Load categories
    var cats = [], samplePhrases = {};
    var explanationPhrases = {}, extraExplanationPhrases = {};
    data.find("cats cat").each(function (catIndex, cat) {
        var name = get('name', cat), x;
        cats.push(name);
        if (x = get('samples', cat))
            samplePhrases[name] = x;
        if (x = get('explanation', cat))
            explanationPhrases[name] = x;
        if (x = $(cat).find('extraExplanation').html())
            extraExplanationPhrases[name] = x;
    });

     // Load Sample Sentences
    var sampleSentences = [], separator = _T[get('lang')].wordSeparator, i;
    data.find("sampleSentences example").each(function (exIndex, ex) {
        var sentence = $(ex).text().replace(/^\s+|\s+$/g, ''), labels = [];
        $(ex).contents().each(function (nodeIndex, node) {
            var text = $(node).text().replace(/^\s+|\s+$/g, '');
            if (!text) return;
            text = text.split(separator);
            var cat = (node.nodeName === 'C') ? $(node).attr("n") : null;
            for (i = 0; i < text.length; i++) {
                labels.push(cat);
            }
        });
        sampleSentences.push([sentence, labels]);
    });

    // Return the task JSON
    return {
        domain: get('domain'),
        lang: get('lang'),
        maxQuestions: get('maxQuestions'),
        hasHint: get('hasHint') === 'true',
        cats: cats,
        samplePhrases: samplePhrases,
        explanationPhrases: explanationPhrases,
        extraExplanationPhrases: extraExplanationPhrases,
        sampleSentences: sampleSentences
    };
};

function failure(data) {
	// Change "... loading questions ..."
	$("#loadingMessage").text("Unable to load questions");

	if (!taskname) {
		$("#wrapper").append("ERROR: Please specify the task to load using " +
			"the URL parameter ?task=[TASKNAME]");
	} else {
		$("#wrapper").append("ERROR: Cannot load task '" + taskName + "'");
	}
}

function complete(data) {
	// if successful, no need to display wrapper message
	$("#wrapper").hide();

	// Get the task data
	TASK = parseXML(data);

	$("#prevButton, #prevLastButton").mouseup(function() {
		showQuestion(currentQuestion-1);
	});

	$("#nextButton").mouseup(function() {
		showQuestion(currentQuestion+1);
	});

	$("#startButton").mouseup(function() {
		showQuestion(savedQuestion);
		$("#startButton").text(_T["Back >"]);
	});

	$("#instructionButton").mouseup(function() {
		showQuestion(-1);
	});

	// load categories for labels
	var categories = TASK.cats;

	// create popup table for labels
	(function() {
		// Create variables needed
		var table = $("<table>"), i, rows = [], n = categories.length;
		var numRows = (n <= 7 ? n : Math.ceil(n/2)); // 2 columns for > 7 categories

		for(i=0; i<n; i++) {
			var td = $("<td>").addClass("c" + i.toString(36)).text(categories[i]);
			if (i < numRows) {
				rows.push($("<tr>").appendTo(table).append(td));
			} else {
				rows[i-numRows].append(td);
			}

			// Load sample phrases
			if (TASK.samplePhrases[categories[i]] !== undefined) {
				var line = $("<p>").appendTo($("#keyExplanationInner"))
					.append($("<span>").addClass("category c" + i.toString(36))
						.text(categories[i]), " ");

				if (TASK.explanationPhrases && TASK.explanationPhrases[categories[i]]) {
					line.append(TASK.explanationPhrases[categories[i]]);
				}

				line.append($("<span>").addClass("examples")
					.text(TASK.samplePhrases[categories[i]], " "));

				if (TASK.extraExplanationPhrases && TASK.extraExplanationPhrases[categories[i]]) {
					$("<p>").appendTo($("#keyExplanationInner"))
						.html(TASK.extraExplanationPhrases[categories[i]]);
				}
			}
		}

		$("#categoryPopup").append(table);
	    $("#innerInstructionDiv .category").each(function (index, elt) {
	        $(elt).addClass("c" + categories.indexOf($(elt).text()).toString(36));
	    });

	} ());

	(function () {
		var examplesDiv = $("#examples"), i;
		TASK.sampleSentences.forEach(function (sentence, index) {
			var sentenceP = $("#example" + index);
			if(sentenceP.length ===0 ) {
				sentenceP = $("<div>").appendTo(examplesDiv);
			}

			var splitted = sentence[0].split(_T.wordSeparator);

			var cue = parseInt(splitted[0]);

			for (i=1; i<splitted.length; i++) {
				var wordDiv = $("<div class='wordDiv'>").appendTo(sentenceP);

				if (i== cue) {
					var wordSpan = $("<p class='cueSpan'>").text(splitted[i])
						.appendo(wordDiv);
				} else {
					var wordCat = $("<p class='wordCat'>").text("\xA0").appendTo(wordDivK);
					var wordSpan = $("<p class='wordSpan'>").text(splitted[i]).appendTo(wordDiv);
					var categoryNumber = categories.indexOf(sentence[1][i]);
					if (categoryNumber !== -1) {
						wordCat.text(categories[categoryNumber]);
						wordSpan.addClass("c" + categoryNumber.toString(36));
					} else if (sentence[1][i] !== null) {
						// Prevent incorrectly-spelled categories
						wordSpan.addClass("c_");
					}
				}
			}

			$("<div class='clearFix sep'>").appendTo(sentenceP.parent());

		});

		$("#categories").val(categories);

	} ());


	var dragging = false, showingPopup = false, dragStartSpan, dragRange;

	function loadIndividualQuestion (query,queryIndex) {
		if (gup("noQLimit") !== 'true' && queryIndex >= TASK.maxQuestions) {
			return;
		}

		var questionDiv = $("<div class='question'>").hide().appendTo("#questionsDiv");

		questionDivArray[queryIndex] = questionDiv;

		// Add the word divs
		var splittedParagraph = $("<p class='splittedQuery unselectable'>").appendTo(questionDiv).attr("unselectable","on");

		$("<p class='clearFix'>").appendTo(questionDiv);

		var cue = -1;

		if(TASK.hasHint) {
			cue = query[1];
			query = query[0];
		}

		var hiddenInput = $("<input type='hidden'>").appendTo(questionDiv).attr("name","cat"+queryIndex);
		var hiddenLog = $("<input type='hidden'>").append(questionDiv).attr("name", "log" + queryIndex);
		var hiddenQuery	= $("<input type='hidden'>").appendTo(questionDiv).attr("name", "q" + queryIndex).val(query);
		var splitted = query.replace(/^\s+|\s+$/g, '').split(_T.wordSeparator);

		for (var i = 0; i<splitted.length; i++) {
			var word = splitted[i];
			if(i == cue) {
				var wordDiv = $("<div class='wordDiv'>").appendTo(splittedParagraph)
					.append($("<p class='cueSpan'>").text(word));
			} else {
				var wordDiv = $("<div class='wordDiv'>").appendTo(splittedParagraph)
					.append($("<p class='wordCat'>").text('\xA0'))
					.append($("<p class='wordSpan'>").text(word)
						.attr("unselectable", "on"));
				hiddenInput.val(hiddenInput.val() + "0");
			}
		}

		var wordSpanList = $(splittedParagraph).find(".wordSpan");

		// Mouse interaction
		splittedParagraph.on("mousedown", ".wordSpan", mouseDown)
						.on("mouseover", ".wordSpan", mouseOver)
						.on("mouseout", ".wordSpan", mouseOut)
						.on("mouseup", ".wordSpan", mouseUp)
						.on("categoryChanged", function (event, category) {
					        //console.log("Chose " + category);
					        dragRange.each(function (index, element) {
					            element = $(element);
					            if (element.data("cat")) {
					                element.removeClass("c" + element.data("cat"));
					                element.removeData("cat");
					                element.prev().text("\xA0");
					            }
					            var categoryNumber = categories.indexOf(category).toString(36);
					            if (categoryNumber === "0") {
					                element.removeClass("colored");
					            } else {
					                element.addClass("colored").addClass("c" + categoryNumber);
					                element.prev().text(category);
					                element.data("cat", categoryNumber);
					            }
					        });

					        // Update the hidden inputs
					        var encoded = "";
					        wordSpanList.each(function (index, element) {
					            encoded += ($(element).data("cat") || 0);
					        });
					        hiddenInput.val(encoded);
					        var startingIndex = wordSpanList.index(dragRange[0]);
					        var endingIndex = startingIndex + dragRange.length - 1;
					        hiddenLog.val(hiddenLog.val() + "("
					                      + category + "," + startingIndex
					                      + "," + endingIndex + ") ");
		    			});
	};

	$("#categoryPopup td").click(function (event) {
	    var category = $(this).text();
	    getCurrentQuestionDiv().find(".splittedQuery")
	        .trigger("categoryChanged", [category]);
	});

	$(document).mouseup(function () {
	    if (dragging) {
	        dragging = false;
	        if (dragStartSpan) {
	            dragStartSpan.removeClass("starting");
	        }
	        //console.log("DraggingClear");
	    } else if (showingPopup) {
	        showingPopup = false;
	        $("#categoryPopup").hide();
	        $(".wordSpan").removeClass("hovering");
	        //console.log("ShowingPopupClear");
	    }
	});
	
	// ----- Load questions -----

    var loadQuestions = function (rawQuestions) {
        $("#loadingStartDiv p").toggleClass("hidden");
        rawQuestions.forEach(loadIndividualQuestion);
        $("#numQuestionsIntro").text(rawQuestions.length);
	$("#startButton").prop("disabled", false);
        if (noAssignmentId) {
            //$("#startButton").prop("disabled", true);
        }
    };

    (function () {
        var rawQuestions = gupsplit("q");
        if (rawQuestions) {
            loadQuestions(rawQuestions);
        } else {
            var dataIndex = gup("dataIndex");
            if (dataIndex !== "") {
                $.getJSON("data/" + dataIndex, loadQuestions);
                $("#dataIndex").val(dataIndex);
            } else if (gup("debug") === "true") {
                TASK.hasHint = false;
                loadQuestions(_T.debugQuestions);
            }
        }
    }());

    $("form").submit(function () {
        return true;   // No validation
    });
};

