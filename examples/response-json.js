'use strict';
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var Toa = require('../index');
var app = Toa(function(thunk) {
  this.body = this.toJSON();
});

app.listen(3000);
