$(document).ready(function() {
	"use strict";

	var assignmentId = gup("assignmentId");
	var noAssignmentId = (!assignmentId || assignmentId === "ASSIGNMENT_ID_NOT_AVAILABLE");

	// Set value of "assignmentId" element in HTML
	$("#assignmentId").val(assignmentId);

	if(noAssignmentId) {
		// We are previewing the HIT so display the helpful message
		$("#warning").show();
	} else {
		// We're doing it for real - enable the submit button and feedback element
		$("#submitButton, #feedback").prop("disabled", false);
	}

	if(gup("turkSubmitTo").indexOf("workersandbox") !== -1) {
		// Sandbox mode
		$("#answerForm").attr("action", "https://workersandbox.mturk.com/mturk/externalSubmit");
	}

	var showText = "...";
	var hideText = "Hide";
	var is_visible = false;
	$("#toggleExtraExamples").click(function() {
		is_visible = !is_visible;
		$(this).html((!is_visible) ? showText : hideText);
		$(this).closest("#instructionsDiv").find("#examples").toggle('fast');
	});
	
});