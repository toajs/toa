'use strict';
// **Github:** https://github.com/thunks/toa
//
// **License:** MIT

var https = require('https');
var fs = require('fs');
var Toa = require('../index');

var options = {
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
};

var server = https.createServer(options);


var app = Toa(server, function (Thunk) {
  this.body = 'Hello World!\n-- toa';
});

app.listen(3000);
