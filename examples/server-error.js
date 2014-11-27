'use strict';
// **Github:** https://github.com/thunks/toa
//
// **License:** MIT

var Toa = require('../index');
var app = Toa(function (Thunk) {
  this.body = 'Hello World!\n-- toa';
  throw new Error('server error');
});

app.listen(3000);
