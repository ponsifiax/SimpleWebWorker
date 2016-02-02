function t(worker) 
{
        it("instance", function(done) {
            var sw = new worker("ressources/worker.js");
            sw.start();
            done();
            sw.terminate();
        });
        
        it("event/string - constructor", function(done) {
            var msg = "test of message";
            var sw = new worker("ressources/worker.js", function(res) {
                if(res === msg)
                    done();
                else
                    throw new Error("message is not egal : "+res+" != "+msg);
            });
            sw.start();
            sw.postMessage(msg)
        });
        
        it("event/object - constructor", function(done) {
            var msg = {a:1,b:2,c:{a:1, b:2}, d:["a"]};
            var sw = new worker("ressources/worker.js", function(res) {
                if(JSON.stringify(res) === JSON.stringify(msg))
                    done();
                else
                    throw new Error("message is not egal : "+res+" != "+msg);
            });
            sw.start();
            sw.postMessage(msg)
        });
        
        it("event/string - mutli events", function(done) {
            var msg = "test of message";
            var sw = new worker("ressources/worker.js");
            var count = 0;
            sw.onMessage(function(res) {
                if(res === msg)
                {
                    count++;
                    if(count === 2)
                        done();
                }
                else
                    throw new Error("message is not egal : "+res+" != "+msg);
            });
            
            sw.onMessage(function(res) {
                if(res === msg)
                {
                    count++;
                    if(count === 2)
                        done();
                }
                else
                    throw new Error("message is not egal : "+res+" != "+msg);
            });
            
            sw.start();
            sw.postMessage(msg)
            
            
        });

        it("event/string - specific event", function(done) {
            var msg = "test of message";
            var sw = new worker("ressources/worker.js");
            sw.on("myEvent", function(res) {
                if(res === msg)
                    done();
                else
                    throw new Error("message is not egal : "+res+" != "+msg);
            });
            sw.start();
            sw.post("myEvent", msg)
        });

        it("event/string - specific events", function(done) {
            var msg = "test of message";
            var sw = new worker("ressources/worker.js");
            var myEvent = false;
            var myEvent2 = false;
            sw.on("myEvent", function(res) {
                if(res === msg)
                {
                    myEvent = true;
                    if(myEvent2)
                        done();
                }
                else
                    throw new Error("message is not egal : "+res+" != "+msg);
            });
            
            sw.on("myEvent2", function(res) {
                if(res === msg)
                {
                    myEvent2 = true;
                    if(myEvent)
                        done();
                }
                else
                    throw new Error("message is not egal : "+res+" != "+msg);
            });
            
            sw.start();
            sw.post("myEvent", msg);
            sw.post("myEvent2", msg);
        });   
        
        it("event/string - event imbriqued", function(done) {
            var msg = "test of message";
            var sw = new worker("ressources/worker.js");
            var myEvent = false;
            var myEvent2 = false;
            sw.on("myEvent", function(res) {
                if(res === msg)
                {
                    this.post("myEvent2", msg);
                }
                else
                    throw new Error("message is not egal : "+res+" != "+msg);
            });
            
            sw.on("myEvent2", function(res) {
                if(res === msg)
                {
                    done();
                }
                else
                    throw new Error("message is not egal : "+res+" != "+msg);
            });
            
            sw.start();
            sw.post("myEvent", msg);
        });
        
        it("close", function(done) {
            var sw = new worker("ressources/worker.js");
            sw.on("myEvent", function() {throw new Error("Worker not closed");});
            sw.start();
            sw.terminate();
            sw.post("myEvent", "test");
            
            setTimeout(function() {done();}, 300);
        });
        
        it("terminate", function(done) {
            var sw = new worker("ressources/worker.js");
            sw.on("myEvent", function() {throw new Error("Worker not closed");});
            sw.start();
            sw.post("close");
            sw.terminate();
            sw.post("myEvent", "test");
            
            setTimeout(function() {done();}, 300);            
        });
}
describe("SimpleWorker", function() {
    describe("Worker", function() {
        t(SimpleWorker);
        
        it("Worker not available", function(done) {
            var tmp = Worker;
            Worker = undefined;
            var d = false;
            try
            {
                var sw = new Worker("ressources/worker.js");
            }
            catch(e)
            {
                done();
                d = e;
            }

            Worker = tmp;
            if(!d)
            {
                throw new Error("Worker available ?");
            }
        });
    });
    
    describe("Shared Worker", function() {
        t(SimpleSharedWorker);
        

        it("SharedWorker not available", function(done) {
            var tmp = SharedWorker;
            SharedWorker = undefined;
            var sw = new SimpleSharedWorker("ressources/worker.js");
            SharedWorker = tmp;
            if(sw.getType() === "Worker")
            {
                done();
            }
            else
            {
                throw new Error("SharedWorker available ?");
            }
        });

        it("SharedWorker and Worker not available", function(done) {
            var tmp = SharedWorker;
            var tmpW = Worker;
            SharedWorker = undefined;
            Worker = undefined;
            var d = false;
            try
            {
                var sw = new SimpleSharedWorker("ressources/worker.js");
            }
            catch(e)
            {
                done();
                d = e;
            }

            SharedWorker = tmp;
            Worker = tmpW;

            if(!d)
            {
                throw new Error("Worker available ?");
            }
        });

    });
}) 
