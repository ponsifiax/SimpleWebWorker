/**
 * SimpleWorker
 * @constructor
 * @param {string} script path to javascript file
 * @param {function} [call] function called on event 'message'
 */
function SimpleWorker(script, call, shared) {
  this.shared = shared || false;
  this.script = script;
  this.callers = {};
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
      this.post("__SimpleWorkerServerTerminate", "false");
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
      
      var eventName = "message";
      if(event.data.event)
            eventName = event.data.event;
      if(self.callers[eventName])
      {
        var tmp = self.callers[eventName];
        for(var e in tmp)
        {
            open = self.callers[eventName][e].call(self, event.data.content);
            
            if(open === false)
                self.callers[eventName].splice(self.callers[eventName].indexOf(self.callers[eventName][e]));
        }
      }
    }, false);
  }


  /**
   * Add function to pile
   * @param {function} execute function in the event Message
   * @return {SimpleWorkerServer}
   */
  this.onMessage = function(func) {
    return this.on("message", func);
  }
  
  
  /**
   * Add function to pile for specific event
   * @param {string} event name
   * @param {function} execute function in the event Message
   * @return {SimpleWorkerServer}
   */
  this.on = function(eventName, func) {
    if(typeof func !== 'function')
    {
      throw new Error("SimpleWorker call parameter must be a function");
    }
    
    if(!this.callers[eventName])
        this.callers[eventName] = [];
    this.callers[eventName].push(func);

    return this;
  }

  /**
   * Post message to worker
   * @return {SimpleWorkerServer}
   */
  this.postMessage = function(content) {
    return this.post("message", content);
  }

  /**
   * Post to worker
   * @return {SimpleWorkerServer}
   */
  this.post = function(eventName, content) {
    this.worker.postMessage({event: eventName, content:content}); 
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
    "post" : function() { return self.post.apply(self, arguments); },
    "start" : function() { return self.startWorker(); },
    "onMessage" : function(func) { return self.onMessage(func); },
    "on" : function(eventName, func) { return self.on(eventName, func); }
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
