'use strict';
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var Toa = require('../index');
var app = Toa(function (Thunk) {
  this.body = 'Hello World!\n-- toa';
});

app.use(function (callback) {
  this.throw(401, new Error('Unauthorized'));
});

app.listen(3000);
