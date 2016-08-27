'use strict'

var tman = require('tman')
var assert = require('assert')
var context = require('../context')

tman.suite('ctx.assert(value, status)', function () {
  tman.it('should throw an error', function () {
    var ctx = context()

    try {
      ctx.assert(false, 404)
      throw new Error('asdf')
    } catch (err) {
      assert.strictEqual(err.status, 404)
      assert.strictEqual(err.expose, true)
    }
  })
})
