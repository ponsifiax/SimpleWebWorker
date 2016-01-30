# SimpleWorker
Simple web worker and shared worker

Classes :
- SimpleWorker : simplication for create worker
- SimpleSharedWorker : simplication for create worker
- SimpleWorkerBack : simplication to worker

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

## SimpleWorkerBack
```
var bws = new SimpleWorkerBack(function(args) {
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

### SimpleWorkerBack

```

var bws = new SimpleWorkerBack();

bws.onMessage(function(message) { /* your code **/ });
bws.onMessage(function(message) { /* your code **/ });
```

