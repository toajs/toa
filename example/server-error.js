'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

const Toa = require('..')
const app = new Toa()

app.use(function () {
  this.body = 'Hello World!\n-- toa'
  throw new Error('server error')
})

app.listen(3000)
