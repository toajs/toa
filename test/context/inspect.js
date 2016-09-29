'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')

tman.suite('ctx.inspect()', function () {
  tman.it('should return a json representation', function () {
    let ctx = context()
    let toJSON = ctx.toJSON(ctx)

    assert.deepEqual(toJSON, ctx.inspect())
  })
})
