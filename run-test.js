var express = require('express');
var app = express();

process.title = process.argv[2];

app.use(express.static(__dirname + '/lib'));
app.use(express.static(__dirname + '/test'));
console.log(__dirname + '/test');
app.get('/', function (req, res) {
  res.sendFile(__dirname+'/test/ressources/run.html');
});

app.listen(3000, function () {}); 
