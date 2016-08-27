'use strict'

var tman = require('tman')
var assert = require('assert')
var context = require('../context')

tman.suite('req.stale', function () {
  tman.it('should be the inverse of req.fresh', function () {
    var ctx = context()
    ctx.status = 200
    ctx.method = 'GET'
    ctx.req.headers['if-none-match'] = '"123"'
    ctx.set('ETag', '"123"')
    assert.strictEqual(ctx.fresh, true)
    assert.strictEqual(ctx.stale, false)
  })
})
