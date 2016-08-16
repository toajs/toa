'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var context = require('../context')

suite('ctx.remove(name)', function () {
  it('should remove a field', function () {
    var ctx = context()
    ctx.set('x-foo', 'bar')
    ctx.remove('x-foo')
    assert.deepEqual(ctx.response.header, {})
  })
})
