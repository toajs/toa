'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var fs = require('fs')
var path = require('path')
var Toa = require('..')
var app = Toa(function () {
  this.type = 'text'
  this.body = fs.createReadStream(path.join(__dirname, 'simple.js'), {encoding: 'utf8'})
})

app.listen(3000)
