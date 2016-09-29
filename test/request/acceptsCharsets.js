'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')

tman.suite('ctx.acceptsCharsets()', function () {
  tman.suite('with no arguments', function () {
    tman.suite('when Accept-Charset is populated', function () {
      tman.it('should return accepted types', function () {
        let ctx = context()
        ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5'
        assert.deepEqual(ctx.acceptsCharsets(), ['utf-8', 'utf-7', 'iso-8859-1'])
      })
    })
  })

  tman.suite('with multiple arguments', function () {
    tman.suite('when Accept-Charset is populated', function () {
      tman.suite('if any types match', function () {
        tman.it('should return the best fit', function () {
          let ctx = context()
          ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5'
          assert.strictEqual(ctx.acceptsCharsets('utf-7', 'utf-8'), 'utf-8')
        })
      })

      tman.suite('if no types match', function () {
        tman.it('should return false', function () {
          let ctx = context()
          ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5'
          assert.strictEqual(ctx.acceptsCharsets('utf-16'), false)
        })
      })
    })

    tman.suite('when Accept-Charset is not populated', function () {
      tman.it('should return the first type', function () {
        let ctx = context()
        assert.strictEqual(ctx.acceptsCharsets('utf-7', 'utf-8'), 'utf-7')
      })
    })
  })

  tman.suite('with an array', function () {
    tman.it('should return the best fit', function () {
      let ctx = context()
      ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5'
      assert.strictEqual(ctx.acceptsCharsets(['utf-7', 'utf-8']), 'utf-8')
    })
  })
})
