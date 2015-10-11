'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var context = require('../context')

describe('req.stale', function () {
  it('should be the inverse of req.fresh', function () {
    var ctx = context()
    ctx.status = 200
    ctx.method = 'GET'
    ctx.req.headers['if-none-match'] = '"123"'
    ctx.set('ETag', '"123"')
    assert.strictEqual(ctx.fresh, true)
    assert.strictEqual(ctx.stale, false)
  })
})
