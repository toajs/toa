'use strict';
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var Toa = require('../index');
var app = Toa(function*(thunk) {
  this.body = yield 'Hello World!\n-- ' + this.config.poweredBy;
});

app.config = {
  poweredBy: 'Test'
};

app.listen(3000);
