'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var request = require('../context').request

describe('req.secure', function () {
  it('should return true when encrypted', function () {
    var req = request()
    req.req.socket = {
      encrypted: true
    }
    assert(req.secure)
  })
})
