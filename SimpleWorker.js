/**
 * SimpleWorker
 * @constructor
 * @param {string} script path to javascript file
 * @param {function} [call] function called on event 'message'
 */
function SimpleWorker(script, call, shared) {
  this.shared = shared || false;
  this.script = script;
  this.callers = [];
  this.worker;
  
  /**
   * initialize class
   * @param {function} [call] function called on event 'message'
   * @private
   */
  this.init = function(call) {
    if(typeof call === 'function')
      this.onMessage(call);

    this.worker = this.shared ? new SharedWorker(script).port : new Worker(script);
    this.listen();
  }  
  
  /**
   * Start Worker
   * @private
   */
  this.startWorker = function() {
    if(this.shared)
      this.worker.start();

    return this;
  }

  /**
   * Terminate Worker
   */
  this.terminate = function() {
    if(this.shared)
      this.onMessage(function() {return false;});
    else
      this.worker.terminate();
  }

  /**
   * Listen on worker and call functions
   * @private
   */
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


  /**
   * Add function to pile
   * @param {function} execute function in the event Message
   * @return {SimpleWorkerServer}
   */
  this.onMessage = function(func) {
    if(typeof func !== 'function')
    {
      throw new Error("WorkerServer call parameter must be a function");
    }
    this.callers.push(func);

    return this;
  }

  /**
   * Post message to worker
   * @return {SimpleWorkerServer}
   */
  this.postMessage = function() {
    this.worker.postMessage.apply(this.worker, arguments); 
    return this; 
  }

  /**
   * Get type
   * @return {string} worker or shared worker 
   */
  this.getType = function() {
    return this.shared ? "SharedWorker" : "Worker";
  }

  this.init(call);
  
  var self = this;
  return {
    "getType" : function() { return self.getType() },
    "terminate" : function() { return self.terminate() },
    "postMessage" : function() { return self.postMessage.apply(self, arguments); },
    "start" : function() { return self.startWorker(); },
    "onMessage" : function(func) { return self.onMessage(func); }
  }
}


/**
 * SimpleSharedWorker
 * @param {string} script path to javascript file
 * @param {function} [call] function called on event 'message'
 */
function SimpleSharedWorker(script, call)
{
  return new SimpleWorker(script, call, true);
}
