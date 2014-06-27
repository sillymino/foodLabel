/*
	Main javascript file
*/

$(document).ready(function() {
	"use strict";

	// Hide warning about turning on Javascript since obviously it's working
	$("#jsWarning").hide();

	// Set value of "assignmentId" element in HTML
	$("#assignmentId").val(assignmentId);

	var noAssignmentId = (!assignmentId || assignmentId === "ASSIGNMENT_ID_NOT_AVAILABLE");

	if(noAssignmentId) {
		// We are previewing the HIT so display the helpful message
		$("#warning").show();
	} else {
		// Here is where we have to  include stuff about the need for qualification test

		// We're doing it for real - enable the submit button and feedback element
		$("#submitButton, #feedback").prop("disabled", false);
	}

	if(gup("turkSubmitTo").indexOf("workersandbox") !== -1) {
		// Sandbox mode
		// Change form submission to sandbox rather than real one
		$("#answerForm").attr("action", "https://workersandbox.mturk.com/mturk/externalSubmit");
	}

	// Functionality to hide/show the example
	var showText = "Show";
	var hideText = "Hide";
	var is_visible = false;
	$("#toggleExtraExamples").click(function() {
		is_visible = !is_visible;
		$(this).html((!is_visible) ? showText : hideText);
		$(this).closest("#instructionsDiv").find("#examples").toggle('fast');
	});

	if (noAssignmentId) {
		//Sandbox mode
		//show the extra examples
    	$("#toggleExtraExamples").click();
	}

	var TASK;
	var taskName = gup('task');

	$.ajax({
		url: 'tasks/' + taskName + '.xml',
		dataType: 'html'
	}).done(function(data){
		//put what happens on success here
		complete(data);
	}).fail(function(data){
		//put what happens on failure here
		failure(data);
	});
});