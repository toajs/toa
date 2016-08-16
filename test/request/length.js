'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var request = require('../context').request

suite('ctx.length', function () {
  it('should return length in content-length', function () {
    var req = request()
    req.header['content-length'] = '10'
    assert.strictEqual(req.length, 10)
  })

  suite('with no content-length present', function () {
    var req = request()
    assert.strictEqual(req.length == null, true)
  })
})
