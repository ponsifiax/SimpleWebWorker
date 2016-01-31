 
var w = new SimpleWorkerServer(function(msg) {
    this.postMessage(msg);
});