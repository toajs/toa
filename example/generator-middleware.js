'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var Toa = require('..')
var app = Toa()

app.use(function *() {
  this.body = yield 'Hello World!\n-- toa'
})

app.listen(3000)
