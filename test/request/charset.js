'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var request = require('../context').request

describe('req.charset', function () {
  describe('with no content-type present', function () {
    it('should return ""', function () {
      var req = request()
      assert.strictEqual(req.charset, '')
    })
  })

  describe('with charset present', function () {
    it('should return ""', function () {
      var req = request()
      req.header['content-type'] = 'text/plain'
      assert.strictEqual(req.charset, '')
    })
  })

  describe('with a charset', function () {
    it('should return the charset', function () {
      var req = request()
      req.header['content-type'] = 'text/plain; charset=utf-8'
      assert.strictEqual(req.charset, 'utf-8')
    })
  })
})
