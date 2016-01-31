importScripts('../SimpleWorkerServer.js');
var w = new SimpleWorkerServer(function(msg) {
    this.postMessage(msg);
});

w.on("myEvent", function(msg) {
    this.post("myEvent", msg);
});

w.on("myEvent2", function(msg) {
    this.post("myEvent2", msg);
});

w.on("close", function() {
   return false; 
});