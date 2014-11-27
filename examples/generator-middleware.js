'use strict';
// **Github:** https://github.com/thunks/toa
//
// **License:** MIT

var Toa = require('../index');
var app = Toa();

app.use(function* () {
  this.body = yield 'Hello World!\n-- toa';
});

app.listen(3000);
