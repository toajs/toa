'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var Toa = require('..')
var app = Toa(function () {
  this.body = 'Hello World!\n-- toa'
})

app.use(function (callback) {
  this.throw(401, new Error('Unauthorized'))
})

app.listen(3000)
