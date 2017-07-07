var express = require('express');
var path = require('path');
var app = express();

// Serve only under /src
app.use(express.static(path.join(__dirname, 'src')));
app.get('/', function(req, res) {
  // By default, this is searched for under /src
  res.sendfile('index.html');
});
var server = app.listen(process.env.PORT || 8001);