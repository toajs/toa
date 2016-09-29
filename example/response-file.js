'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

const fs = require('fs')
const path = require('path')
const Toa = require('..')

const app = new Toa()
app.use(function () {
  this.type = 'text'
  this.body = fs.createReadStream(path.join(__dirname, 'simple.js'), {encoding: 'utf8'})
})

app.listen(3000)
