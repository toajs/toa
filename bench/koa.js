'use strict'
// **License:** MIT
// wrk -t10 -c1000 -d30s http://127.0.0.1:3000

const koa = require('koa')
const app = koa()
const port = 3333

var n = parseInt(process.env.MW || '1', 10)
process.stdout.write('  koa, ' + n + ' middleware:')

while (n--) {
  app.use(function * (next) {
    yield (done) => setImmediate(done) // fake task
    yield * next
  })
}

var body = new Buffer('Hello World')
app.use(function * () {
  this.body = body
})

app.listen(port)
