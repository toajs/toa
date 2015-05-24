'use strict';
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var Toa = require('../index');
var app = Toa(function() {
  this.body = 'Hello World!\n-- toa';
  throw new Error('server error');
});

app.listen(3000);
