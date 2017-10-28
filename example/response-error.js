'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

const Toa = require('..')
const app = new Toa()

app.use(function () {
  this.throw(401, new Error('Unauthorized'))
})

app.use(function () {
  this.body = 'Hello World!\n-- toa'
})

app.listen(3000)
