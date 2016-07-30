'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

const Toa = require('..')
const app = Toa(function () {
  // this function will run after all middlewares
  this.body = this.state
})
// support sync function middleware
app.use(function () {
  this.state.syncFn = 'support!'
})
// support thunk function middleware
app.use(function (next) {
  this.state.thunkFn = 'support!'
  setTimeout(next, 10)
})
// support generator function middleware
app.use(function * () {
  this.state.generatorFn = yield Promise.resolve('support!')
})
// support async function middleware in babel or Node.js v7~
// babel-node --presets es2015 --plugins transform-async-to-generator example/simple.js
// app.use(async function () {
//   this.state.asyncFn = await Promise.resolve('support!')
// })

app.listen(3000, () => console.log('App start at 3000'))
