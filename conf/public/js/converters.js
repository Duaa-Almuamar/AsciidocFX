var myWorker = new Worker("/afx/worker/webworker.js");
myWorker.onmessage = function (e) {

    var data = (typeof e.data) == "string" ? JSON.parse(e.data) : e.data;

    if (data.type == "log") {
        afx.completeWebWorkerExceptionally(JSON.stringify(data.message), data.taskId);
    }
    else if (data.type == "afx") {
        afx[data.func].apply(afx, data.parameters);
    }

};

myWorker.onerror = function (e) {
    var data = (typeof e) == "string" ? e : JSON.stringify(e);
    afx.log(data);
};

myWorker.postMessage();

function getOption(options) {
    return Opal.hash(JSON.parse(options));
}

var fillOutAction = new BufferedAction();

function convertBackend(taskId, content, options) {
    var message = {
        func: arguments.callee.caller.name,
        taskId: taskId,
        content: content,
        options: options
    };

    myWorker.postMessage(JSON.stringify(message));
}

function convertAsciidoc(taskId, content, options) {
    convertBackend(taskId, content, options);
}

function convertOdf(taskId, content, options) {
    var doc = Opal.Asciidoctor.$load(content, getOption(options));
    var rendered = doc.$convert();

    afx.completeWebWorker(taskId, rendered, doc.$backend(), doc.doctype);
}

function convertHtml(taskId, content, options) {
    convertBackend(taskId, content, options);
}

function convertDocbook(taskId, content, options) {
    convertBackend(taskId, content, options);
}

function findRenderedSelection(content) {
    return Opal.Asciidoctor.$render(content);
}