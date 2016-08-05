'use strict'
// **License:** MIT
// wrk -t10 -c1000 -d30s http://127.0.0.1:3333

const toa = require('..')
const app = toa()
const port = 3333

var n = parseInt(process.env.MW || '1', 10)
process.stdout.write('  toa, ' + n + ' middleware:')

while (n--) {
  app.use(function * () {})
}

var body = new Buffer('Hello World')
app.use(function * () {
  this.body = body
})

app.listen(port)
