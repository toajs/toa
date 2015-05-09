'use strict';
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var Toa = require('../index');
var app = Toa();

app.use(function(callback) {
  this.body = 'Hello World!\n-- toa';
  callback();
});

app.listen(3000);
