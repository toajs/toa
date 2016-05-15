'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var Toa = require('..')
var app = Toa(function () {
  // this.status = 202
  this.body = 'Hello World!\n-- toa'
})

app.listen(3000)
