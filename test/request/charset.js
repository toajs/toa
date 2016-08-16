'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var request = require('../context').request

suite('req.charset', function () {
  suite('with no content-type present', function () {
    it('should return ""', function () {
      var req = request()
      assert.strictEqual(req.charset, '')
    })
  })

  suite('with charset present', function () {
    it('should return ""', function () {
      var req = request()
      req.header['content-type'] = 'text/plain'
      assert.strictEqual(req.charset, '')
    })
  })

  suite('with a charset', function () {
    it('should return the charset', function () {
      var req = request()
      req.header['content-type'] = 'text/plain; charset=utf-8'
      assert.strictEqual(req.charset, 'utf-8')
    })
  })
})
