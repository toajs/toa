'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var context = require('../context')

suite('ctx.acceptsEncodings()', function () {
  suite('with no arguments', function () {
    suite('when Accept-Encoding is populated', function () {
      it('should return accepted types', function () {
        var ctx = context()
        ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2'
        assert.deepEqual(ctx.acceptsEncodings(), ['gzip', 'compress', 'identity'])
        assert.strictEqual(ctx.acceptsEncodings('gzip', 'compress'), 'gzip')
      })
    })

    suite('when Accept-Encoding is not populated', function () {
      it('should return identity', function () {
        var ctx = context()
        assert.deepEqual(ctx.acceptsEncodings(), ['identity'])
        assert.strictEqual(ctx.acceptsEncodings('gzip', 'deflate', 'identity'), 'identity')
      })
    })
  })

  suite('with multiple arguments', function () {
    it('should return the best fit', function () {
      var ctx = context()
      ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2'
      assert.deepEqual(ctx.acceptsEncodings('compress', 'gzip'), 'gzip')
      assert.deepEqual(ctx.acceptsEncodings('gzip', 'compress'), 'gzip')
    })
  })

  suite('with an array', function () {
    it('should return the best fit', function () {
      var ctx = context()
      ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2'
      assert.deepEqual(ctx.acceptsEncodings(['compress', 'gzip']), 'gzip')
    })
  })
})
