'use strict'
// **License:** MIT
// wrk -t10 -c1000 -d30s http://127.0.0.1:3333

const koa = require('koa')
const app = koa()
const port = 3333

var n = parseInt(process.env.MW || '1', 10)
process.stdout.write('  koa, ' + n + ' middleware:')

while (n--) {
  app.use(function * (next) {
    yield * next
  })
}

app.use(function * () {
  this.body = 'Hello World'
})

app.listen(port)
