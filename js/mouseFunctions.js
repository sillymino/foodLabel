function mouseDown() {
	if (!showingPopup) {
		dragging = true;
		dragStartSpan = $(this).addClass("starting").addClass("hovering");
	}
};

function mouseOver() {
	if (dragging) {
		var index1 = wordSpanList.index(dragStartSpan);
		var index2 = wordSpanList.index($(this));
		wordSpanList.slice(Math.min(index1, index2),Math.max(index1, index2) + 1).addClass("hovering");
	}
};

function mouseOut() {
	if (dragging) {
		$(splittedParagraph).find(".wordSpan").removeClass("hovering");
	}
};

function mouseUp() {
	if (dragging) {
		var index1 = wordSpanList.index(dragStartSpan);
		var index2 = wordSpanList.index($(this));
		dragRange = wordSpanList.slice(Math.min(index1, index2),Math.max(index1, index2) + 1);

		// Show the categories
		$("#categoryPopup").show().offset({
			left: Math.min($(window).width() - $("#categoryPopup").width() - 5,
				event.pageX + 2),
			top: event.pageY + 2
		});
	showingPopup = true;
	}
};
