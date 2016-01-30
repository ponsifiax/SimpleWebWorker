
function SimpleWorker(script, call, shared) {
  this.shared = shared || false;
  this.script = script;
  this.callers = [];
  this.worker;
  
  this.init = function(call) {
    if(typeof call === 'function')
      this.addCaller(call);

    this.worker = this.shared ? new SharedWorker(script).port : new Worker(script);
    this.listen();
  }  
  
  this.startWorker = function() {
    if(this.shared)
      this.worker.start();

    return this;
  }

  this.close = function() {
    if(this.shared)
      this.addCaller(function() {return false;});
    else
      this.worker.close();
  }

  this.terminate = function() {
    if(this.shared)
      this.addCaller(function() {return false;});
    else
      this.worker.terminate();
  }

  this.listen = function() {
    var self = this;
    this.worker.addEventListener("message",  function(event) {
      var open;
      var tmp = self.callers;
      for(var e in tmp)
      {
        open = self.callers[e].call(self.worker, event.data);
        if(open === false)
          self.callers.splice(self.callers.indexOf(self.callers[e]));
      }
    }, false);
  }

  this.addCaller = function(func) {
    if(typeof func !== 'function')
    {
      throw new Error("WorkerServer call parameter must be a function");
    }
    this.callers.push(func);

    return this;
  }

  this.init(call);
  
  var self = this;
  return {
    "getType" : function() {return self.shared ? "SharedWorker" : "Worker";},
    "close" : self.close,
    "terminate" : self.terminate,
    "postMessage" : function() { self.worker.postMessage.apply(self.worker, arguments); return self;},
    "start" : function() {return self.startWorker();},
    "onMessage" : function(func) { return self.addCaller(func); }
  }
}


function SimpleSharedWorker(script, call)
{
  return new SimpleWorker(script, call, true);
}
