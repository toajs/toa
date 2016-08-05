'use strict'
// **License:** MIT
// wrk -t10 -c1000 -d30s http://127.0.0.1:3000

const http = require('http')
const app = http.createServer(function (req, res) {
  let body = 'Hello World!'
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Length', Buffer.byteLength(body))
  res.statusCode = 200
  res.end(body)
})

app.listen(3000)
