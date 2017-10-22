'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

// run: node --expose-http2 http2.js
// Visit: https://127.0.0.1:3000/
const http2 = require('http2')
const fs = require('fs')
const Toa = require('..')
const server = http2.createSecureServer({
  key: fs.readFileSync('./localhost.key'),
  cert: fs.readFileSync('./localhost.crt')
})

const app = new Toa(server)
app.use(function () {
  this.body = 'Hello World!\n-- toa'
})

app.listen(3000, () => console.log('https://127.0.0.1:3000/'))
