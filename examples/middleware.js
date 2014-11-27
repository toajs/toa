'use strict';
// **Github:** https://github.com/thunks/toa
//
// **License:** MIT

var Toa = require('../index');
var app = Toa();

app.use(function (next) {
  this.body = 'Hello World!\n-- toa';
  next();
});

app.listen(3000);
