# SimpleWorker
Simple web worker and shared worker

Classes :
- SimpleWorker : simplication for create worker
- SimpleSharedWorker : simplication for create shared worker
- SimpleWorkerServer : simplication to worker (worker or sharedworker)

## SimpleWorker
```
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
```
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
```
var bws = new SimpleWorkerServer(function(args) {
  this.postMessage(args); // send data to SimpleWorker or SimpleShareWorker (Front)
});

```


## Multi events

### SimpleWorker or SimpleSharedWorker

```
var sw = new SimpleWorker("/worker.js");

sw.onMessage(function(message) { /* your code **/ });
sw.onMessage(function(message) { /* your code **/ });
```

### SimpleWorkerServer

```

var bws = new SimpleWorkerServer();

bws.onMessage(function(message) { /* your code **/ });
bws.onMessage(function(message) { /* your code **/ });
```

TODO :
- Close worker
- Terminate worker
