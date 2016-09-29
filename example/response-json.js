'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

const Toa = require('..')
const app = new Toa()

app.use(function () {
  this.body = this.toJSON()
})

app.listen(3000)
