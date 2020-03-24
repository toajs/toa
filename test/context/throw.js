'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('supertest')
const Toa = require('../..')
const context = require('../context')

tman.suite('ctx.throw(msg)', function () {
  tman.it('should set .status to 500', function (done) {
    const ctx = context()

    try {
      ctx.throw('boom')
    } catch (err) {
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.expose, false)
      done()
    }
  })
})

tman.suite('ctx.throw(err)', function () {
  tman.it('should set .status to 500', function (done) {
    const ctx = context()
    const err = new Error('test')

    try {
      ctx.throw(err)
    } catch (err) {
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.message, 'test')
      assert.strictEqual(err.expose, false)
      done()
    }
  })
})

tman.suite('ctx.throw(status, err)', function () {
  tman.it('should throw the error and set .status', function (done) {
    const ctx = context()
    const error = new Error('test')

    try {
      ctx.throw(422, error)
    } catch (err) {
      assert.strictEqual(err.status, 422)
      assert.strictEqual(err.message, 'test')
      assert.strictEqual(err.expose, true)
      done()
    }
  })
})

tman.suite('ctx.throw(status, msg)', function () {
  tman.it('should throw an error', function (done) {
    const ctx = context()

    try {
      ctx.throw(400, 'name required')
    } catch (err) {
      assert.strictEqual(err.message, 'name required')
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.expose, true)
      done()
    }
  })
})

tman.suite('ctx.throw(status)', function () {
  tman.it('should throw an error', function (done) {
    const ctx = context()

    try {
      ctx.throw(400)
    } catch (err) {
      assert.strictEqual(err.message, 'Bad Request')
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.expose, true)
      done()
    }
  })
})

tman.suite('ctx.throw(status, msg, props)', function () {
  tman.it('should mixin props', function (done) {
    const ctx = context()

    try {
      ctx.throw(400, 'msg', {
        prop: true
      })
    } catch (err) {
      assert.strictEqual(err.message, 'msg')
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.expose, true)
      assert.strictEqual(err.prop, true)
      done()
    }
  })

  tman.suite('when props include status', function () {
    tman.it('should be ignored', function (done) {
      const ctx = context()

      try {
        ctx.throw(400, 'msg', {
          prop: true,
          status: -1
        })
      } catch (err) {
        assert.strictEqual(err.message, 'msg')
        assert.strictEqual(err.status, 400)
        assert.strictEqual(err.expose, true)
        assert.strictEqual(err.prop, true)
        done()
      }
    })
  })
})

tman.suite('ctx.throw(msg, props)', function () {
  tman.it('should mixin props', function (done) {
    const ctx = context()

    try {
      ctx.throw('msg', {
        prop: true
      })
    } catch (err) {
      assert.strictEqual(err.message, 'msg')
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.expose, false)
      assert.strictEqual(err.prop, true)
      done()
    }
  })
})

tman.suite('ctx.throw(status, props)', function () {
  tman.it('should mixin props', function (done) {
    const ctx = context()

    try {
      ctx.throw(400, {
        prop: true
      })
    } catch (err) {
      assert.strictEqual(err.message, 'Bad Request')
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.expose, true)
      assert.strictEqual(err.prop, true)
      done()
    }
  })
})

tman.suite('ctx.throw(err, props)', function () {
  tman.it('should mixin props', function (done) {
    const ctx = context()

    try {
      ctx.throw(new Error('test'), {
        prop: true
      })
    } catch (err) {
      assert.strictEqual(err.message, 'test')
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.expose, false)
      assert.strictEqual(err.prop, true)
      done()
    }
  })
})

tman.suite('ctx.throw with custom ctx.createError', function () {
  tman.it('should use custom ctx.createError', function (done) {
    const app = new Toa()
    app.use(function () {
      this.throw(500)
    })
    const _createError = app.context.createError

    app.context.createError = function () {
      const err = _createError.apply(null, arguments)
      err.url = this.originalUrl
      return err
    }

    app.onerror = function (err) {
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.url, '/test-error')
      done()
    }

    request(app.listen()).get('/test-error').end(function (err) {
      if (err) done(err)
    })
  })
})
