var TASK;

$(document).ready(function () {

    // Load task from tasks/[TASKNAME].xml
    var taskName = gup('task');
    $.ajax({
        url: 'tasks/' + taskName + '.xml',
        dataType: 'html'
    }).done(function (data) {
        TASK = parseXML(data);
        startMain();
    }).fail(function (data) {
        if (!taskName) {
            $("#wrapper").append("ERROR: Please specify the task to load using " +
                                 "the URL parameter ?task=[TASKNAME]");
        } else {
            $("#wrapper").append("ERROR: Cannot load task '" + taskName + "'");
        }
    });

});