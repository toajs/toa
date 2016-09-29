'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT
// `ts-node example/simple.ts`

import { Toa } from '..'

const app = new Toa()

app.use(function () {
  this.body = 'support sync function middleware!\n'
})

app.use(function (next) {
  this.body += 'support thunk function middleware!\n'
  next()
})

app.use(function * () {
  this.body += yield Promise.resolve('support generator function middleware!\n')
})

app.use(async function () {
  this.body += await Promise.resolve('support async/await function middleware!\n')
})

app.listen(3000, () => console.log('App start at 3000'))
