'use strict'

var tman = require('tman')
var assert = require('assert')
var context = require('../context')

tman.suite('ctx.inspect()', function () {
  tman.it('should return a json representation', function () {
    var ctx = context()
    var toJSON = ctx.toJSON(ctx)

    assert.deepEqual(toJSON, ctx.inspect())
  })
})
