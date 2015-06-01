'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var request = require('../context').request

describe('ctx.length', function () {
  it('should return length in content-length', function () {
    var req = request()
    req.header['content-length'] = '10'
    assert(req.length === 10)
  })

  describe('with no content-length present', function () {
    var req = request()
    assert(req.length == null)
  })
})
