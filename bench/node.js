'use strict'
// **License:** MIT

const http = require('http')
const app = http.createServer(function (req, res) {
  let body = 'Hello World!'
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Length', Buffer.byteLength(body))
  res.statusCode = 200
  res.end(body)
})

app.listen(3000)
