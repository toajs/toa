'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')

tman.suite('ctx.assert(value, status)', function () {
  tman.it('should throw an error', function () {
    let ctx = context()

    try {
      ctx.assert(false, 404)
      throw new Error('asdf')
    } catch (err) {
      assert.strictEqual(err.status, 404)
      assert.strictEqual(err.expose, true)
    }
  })
})
