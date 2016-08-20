'use strict'
// **License:** MIT
// wrk -t10 -c1000 -d30s http://127.0.0.1:3333

const express = require('express')
const app = express()
const port = 3333

var n = parseInt(process.env.MW || '1', 10)
process.stdout.write('  express, ' + n + ' middleware:')

while (n--) {
  app.use(function (req, res, next) {
    next()
  })
}

app.use(function (req, res) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.end('Hello World')
})

app.listen(port)
