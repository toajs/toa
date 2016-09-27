'use strict'
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

// babel-node --presets es2015 --plugins transform-async-to-generator example/es-next.es
// or wait for Node.js v7~

import ilog from 'ilog'
import Toa from '..'

const app = Toa(function * () {
  this.state.generator = yield Promise.resolve(true)
  this.body = this.state
})

app.use(async function () {
  this.state.async = await Promise.resolve(true)
})

// You should not write in this way:
// app.use(async () => {
//   console.log('context:', this)
//   this.state.async = await Promise.resolve(true)
// })

app.listen(3000, () => ilog.info(`App start at: 3000`))
