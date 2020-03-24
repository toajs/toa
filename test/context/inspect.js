'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')

tman.suite('ctx.inspect()', function () {
  tman.it('should return a json representation', function () {
    const ctx = context()
    const toJSON = ctx.toJSON(ctx)

    assert.deepStrictEqual(toJSON, ctx.inspect())
  })
})
