'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var context = require('../context')

suite('ctx.get(name)', function () {
  it('should return the field value', function () {
    var ctx = context()
    ctx.req.headers.host = 'http://google.com'
    ctx.req.headers.referer = 'http://google.com'
    assert.strictEqual(ctx.get('HOST'), 'http://google.com')
    assert.strictEqual(ctx.get('Host'), 'http://google.com')
    assert.strictEqual(ctx.get('host'), 'http://google.com')
    assert.strictEqual(ctx.get('referer'), 'http://google.com')
    assert.strictEqual(ctx.get('referrer'), 'http://google.com')
  })
})
