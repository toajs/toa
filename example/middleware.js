'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var Toa = require('..')
var app = Toa()

app.use(function (callback) {
  this.body = 'Hello World!\n-- toa'
  callback()
})

app.listen(3000)
