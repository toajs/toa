'use strict'
// **License:** MIT

// wrk -t10 -c1000 -d20s http://127.0.0.1:3000

const toa = require('..')
const app = toa(function () {
  this.body = 'Hello World!'
})

app.listen(3000)
