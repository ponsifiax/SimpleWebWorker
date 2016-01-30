/**
 * SimpleWorkerServer
 * @constructor
 * @param {function} [call] function called on event 'message'
 */
function SimpleWorkerServer(call) {
  this.worker = self;
  this.callers = [];
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

    this.listen(this.worker); 
    
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
    this.ports.push(port);
    this.listen(port);
    port.start();
  }

  /**
   * Listen message from worker or port
   * @param {worker|worker.port} listen
   * @private
   */
  this.listen = function(listen) {
    listen.addEventListener("message",  function(event) {
      var open;
      for(var e in current.callers)
      {
        open = current.callers[e].call(listen, event.data);
        if(open === false)
        {
          current.ports.splice(current.ports.indexOf(listen));          
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
    if(typeof func !== 'function')
    {
      throw new Error("beeWorkerServer call parameter must be a function");
    }
    current.callers.push(func);

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
    "onMessage" : function(func) { return current.onMessage(func); }
  }
}
