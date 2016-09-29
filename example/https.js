'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

const https = require('https')
const fs = require('fs')
const Toa = require('..')

const options = {
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
}

const server = https.createServer(options)

const app = new Toa(server)
app.use(function () {
  this.body = 'Hello World!\n-- toa'
})

app.listen(3000)
