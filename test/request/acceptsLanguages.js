'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var context = require('../context')

suite('ctx.acceptsLanguages(langs)', function () {
  suite('with no arguments', function () {
    suite('when Accept-Language is populated', function () {
      it('should return accepted types', function () {
        var ctx = context()
        ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt'
        assert.deepEqual(ctx.acceptsLanguages(), ['es', 'pt', 'en'])
      })
    })
  })

  suite('with multiple arguments', function () {
    suite('when Accept-Language is populated', function () {
      suite('if any types types match', function () {
        it('should return the best fit', function () {
          var ctx = context()
          ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt'
          assert.strictEqual(ctx.acceptsLanguages('es', 'en'), 'es')
        })
      })

      suite('if no types match', function () {
        it('should return false', function () {
          var ctx = context()
          ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt'
          assert.strictEqual(ctx.acceptsLanguages('fr', 'au'), false)
        })
      })
    })

    suite('when Accept-Language is not populated', function () {
      it('should return the first type', function () {
        var ctx = context()
        assert.strictEqual(ctx.acceptsLanguages('es', 'en'), 'es')
      })
    })
  })

  suite('with an array', function () {
    it('should return the best fit', function () {
      var ctx = context()
      ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt'
      assert.strictEqual(ctx.acceptsLanguages(['es', 'en']), 'es')
    })
  })
})
