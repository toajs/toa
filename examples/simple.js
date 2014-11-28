'use strict';
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var Toa = require('../index');
var app = Toa(function (Thunk) {
  this.body = 'Hello World!\n-- toa';
});

app.listen(3000);
