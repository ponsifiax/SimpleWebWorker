# SimpleWorker
Simple web worker and shared worker

Classes :
- SimpleWorker : simplication for create worker
- SimpleSharedWorker : simplication for create shared worker
- SimpleWorkerServer : simplication to worker (worker or sharedworker)

## SimpleWorker
``` javascript
  var sw = new SimpleWorker("/worker.js",
    function(data) {
        console.log(data); // worker "back" response
        this.postMessage("my data"); // send data to "back"
      }
  });
  
  worker.start();
  
  worker.postMessage("to back");
```

## SimpleSharedWorker
``` javascript
  var sw = new SimpleSharedWorker("/worker.js",
    function(data) {
        console.log(data); // worker "back" response
        this.postMessage("my data"); // send data to "back"
      }
  });
  
  worker.start();
  
  worker.postMessage("to back");
```

## SimpleWorkerServer
``` javascript
importScripts('SimpleWorkerServer.js');
var bws = new SimpleWorkerServer(function(data) {
  this.postMessage(data); // send data to SimpleWorker or SimpleShareWorker (Front)
});

```


## Multi events

### SimpleWorker or SimpleSharedWorker

``` javascript
var sw = new SimpleWorker("/worker.js");

sw.onMessage(function(message) { /* your code **/ });
sw.on("my event", function(message) { /* your code **/ });
```

### SimpleWorkerServer

``` javascript
var bws = new SimpleWorkerServer();

bws.onMessage(function(message) { 
    ...
    this.post("event", "other messsage");
    this.postMessage("my messsage");
});
bws.on("my event", function(message) { /* your code **/ });
```

## Specific event

### SimpleWorker or SimpleSharedWorker
``` javascript
var sw = new SimpleWorker("/worker.js");

sw.on("my event", function(message) { 
    ... 
    this.post("third event", "other message");
});
sw.on("second event", function(message) { /* your code **/ });

sw.post("my event", "my content");
```


### SimpleWorkerServer
``` javascript
var bws = new SimpleWorkerServer();

bws.postMessage("myMessage"); // send message for all ports
bws.post("myevent", "myMessage"); // send specific message at all ports
bws.on("my event", function(message) { 
    ...
    this.post("myevent", "other message"); // send message at current port only
});
```


## Stop Worker 

### SimpleWorker or SimpleSharedWorker
``` javascript
var sw = new SimpleWorker("/worker.js");

sw.terminate(); // close only for current port
```

### SimpleWorkerServer
``` javascript
var bws = new SimpleWorkerServer();
bws.close(); // close worker or close all port (if shared)
bws.on("my event", function(message) { 
    ...
    this.close(); // close worker or close port (if shared)
});
```