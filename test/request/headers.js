'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var request = require('../context').request

suite('req.headers', function () {
  it('should return the request header object', function () {
    var req = request()
    assert.strictEqual(req.headers, req.req.headers)
  })
})
