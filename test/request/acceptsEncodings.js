'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')

tman.suite('ctx.acceptsEncodings()', function () {
  tman.suite('with no arguments', function () {
    tman.suite('when Accept-Encoding is populated', function () {
      tman.it('should return accepted types', function () {
        let ctx = context()
        ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2'
        assert.deepEqual(ctx.acceptsEncodings(), ['gzip', 'compress', 'identity'])
        assert.strictEqual(ctx.acceptsEncodings('gzip', 'compress'), 'gzip')
      })
    })

    tman.suite('when Accept-Encoding is not populated', function () {
      tman.it('should return identity', function () {
        let ctx = context()
        assert.deepEqual(ctx.acceptsEncodings(), ['identity'])
        assert.strictEqual(ctx.acceptsEncodings('gzip', 'deflate', 'identity'), 'identity')
      })
    })
  })

  tman.suite('with multiple arguments', function () {
    tman.it('should return the best fit', function () {
      let ctx = context()
      ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2'
      assert.deepEqual(ctx.acceptsEncodings('compress', 'gzip'), 'gzip')
      assert.deepEqual(ctx.acceptsEncodings('gzip', 'compress'), 'gzip')
    })
  })

  tman.suite('with an array', function () {
    tman.it('should return the best fit', function () {
      let ctx = context()
      ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2'
      assert.deepEqual(ctx.acceptsEncodings(['compress', 'gzip']), 'gzip')
    })
  })
})
