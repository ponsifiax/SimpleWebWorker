function SimpleWorkerServerPort(server, port) {
    this.port = port;
    this.server = server;
    this.postMessage = function(content) {this.server.postMessage(this.port, content);};
    this.post = function(eventName, content) {this.server.post(this.port, eventName, content);};
}

/**
 * SimpleWorkerServer
 * @constructor
 * @param {function} [call] function called on event 'message'
 */
function SimpleWorkerServer(call) {
  this.worker = self;
  this.callers = {};
  this.ports = [];
  this.shared = false;

  var current = this; 

  /**
   * initialize class
   * @param {function} [call] function called on event 'message'
   * @private
   */
  this.init = function(call) {
    
    if(typeof call === 'function')
      this.onMessage(call);

    this.listen(new SimpleWorkerServerPort(this, this.worker)); 
    
    this.worker.addEventListener("connect", function(event) {
      current.initPort(event.ports[0]);
    }, false);
  }

  /**
   * initialize port (shared worker only)
   * @param {port} [port] port to listen
   * @private
   */
  this.initPort = function(port)
  {
    this.shared = true;
    var p = new SimpleWorkerServerPort(this, port)
    this.ports.push(p);
    this.listen(p);
    port.start();
  }

  /**
   * Listen message from worker or port
   * @param {worker|worker.port} listen
   * @private
   */
  this.listen = function(p) {
    p.port.addEventListener("message",  function(event) {
      var open;
      var eventName = "message";
      if(event.data.event)
        eventName = event.data.event;
      if(current.callers.hasOwnProperty(eventName))
      {
        for(var e in current.callers[eventName])
        {
            open = current.callers[eventName][e].call(p, event.data.content);
            if(open === false)
            {
                current.ports.splice(current.ports.indexOf(p));          
            }
        }
      }
    }, false);
  }

  /**
   * Add function to pile
   * @param {SimpleWorkerServerPort} workerPort
   * @param {string|Object} 
   * @return {SimpleWorkerServer}
   */
  this.postMessage = function(workerPort, content) {
      this.post(workerPort, "message", content)
      return this;
  }
  
  /**
   * Add function to pile for specific message
   * @param {SimpleWorkerServerPort} workerPort
   * @param {string} event name
   * @param {string|Object} 
   * @return {SimpleWorkerServer}
   */
  this.post = function(workerPort, eventName, content) {
      workerPort.postMessage({event: eventName, content: content});
      return this;
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
      throw new Error("SimpleWorkerServer call parameter must be a function");
    }
    
    if(!this.callers[eventName])
      this.callers[eventName] = [];
        
    current.callers[eventName].push(func);

    return this;
  }

  /**
   * Get type
   * @return {string} worker or shared worker 
   */
  this.getType = function() {
    return this.shared ? "SharedWorker" : "Worker";
  }
  
    /**
   * Close Worker / port workers
   */
  this.close = function() {
    if(!this.shared)
    {
      this.worker.close();
    }
    else
    {
      for(var e in this.ports)
      {
        this.ports[e].close();
      }
      this.ports = [];
    }
  }


  this.init(call);

  return {
    "getType" : function() { return current.getType(); },
    "close" : function() { return current.close() },
    //"getPorts" : function() {return current.ports;},
    "onMessage" : function(func) { return current.onMessage(func); },
    "on" : function(event, func) { return current.on(event, func); },
    "post" : function(event, func) { return current.post(event, func); },
    "postMessage" : function(event, func) { return current.postMessage(event, func); }
  }
}
