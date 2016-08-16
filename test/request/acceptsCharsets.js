'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var context = require('../context')

suite('ctx.acceptsCharsets()', function () {
  suite('with no arguments', function () {
    suite('when Accept-Charset is populated', function () {
      it('should return accepted types', function () {
        var ctx = context()
        ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5'
        assert.deepEqual(ctx.acceptsCharsets(), ['utf-8', 'utf-7', 'iso-8859-1'])
      })
    })
  })

  suite('with multiple arguments', function () {
    suite('when Accept-Charset is populated', function () {
      suite('if any types match', function () {
        it('should return the best fit', function () {
          var ctx = context()
          ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5'
          assert.strictEqual(ctx.acceptsCharsets('utf-7', 'utf-8'), 'utf-8')
        })
      })

      suite('if no types match', function () {
        it('should return false', function () {
          var ctx = context()
          ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5'
          assert.strictEqual(ctx.acceptsCharsets('utf-16'), false)
        })
      })
    })

    suite('when Accept-Charset is not populated', function () {
      it('should return the first type', function () {
        var ctx = context()
        assert.strictEqual(ctx.acceptsCharsets('utf-7', 'utf-8'), 'utf-7')
      })
    })
  })

  suite('with an array', function () {
    it('should return the best fit', function () {
      var ctx = context()
      ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5'
      assert.strictEqual(ctx.acceptsCharsets(['utf-7', 'utf-8']), 'utf-8')
    })
  })
})
