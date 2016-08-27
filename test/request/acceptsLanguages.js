'use strict'

var tman = require('tman')
var assert = require('assert')
var context = require('../context')

tman.suite('ctx.acceptsLanguages(langs)', function () {
  tman.suite('with no arguments', function () {
    tman.suite('when Accept-Language is populated', function () {
      tman.it('should return accepted types', function () {
        var ctx = context()
        ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt'
        assert.deepEqual(ctx.acceptsLanguages(), ['es', 'pt', 'en'])
      })
    })
  })

  tman.suite('with multiple arguments', function () {
    tman.suite('when Accept-Language is populated', function () {
      tman.suite('if any types types match', function () {
        tman.it('should return the best fit', function () {
          var ctx = context()
          ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt'
          assert.strictEqual(ctx.acceptsLanguages('es', 'en'), 'es')
        })
      })

      tman.suite('if no types match', function () {
        tman.it('should return false', function () {
          var ctx = context()
          ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt'
          assert.strictEqual(ctx.acceptsLanguages('fr', 'au'), false)
        })
      })
    })

    tman.suite('when Accept-Language is not populated', function () {
      tman.it('should return the first type', function () {
        var ctx = context()
        assert.strictEqual(ctx.acceptsLanguages('es', 'en'), 'es')
      })
    })
  })

  tman.suite('with an array', function () {
    tman.it('should return the best fit', function () {
      var ctx = context()
      ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt'
      assert.strictEqual(ctx.acceptsLanguages(['es', 'en']), 'es')
    })
  })
})
