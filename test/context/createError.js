'use strict'

const tman = require('tman')
const assert = require('assert')
const context = require('../context')

tman.suite('ctx.createError(msg)', function () {
  tman.it('should set .status to 500', function () {
    const ctx = context()

    const err = ctx.createError('boom')
    assert.strictEqual(err.status, 500)
    assert.strictEqual(err.expose, false)
  })
})

tman.suite('ctx.createError(err)', function () {
  tman.it('should set .status to 500', function () {
    const ctx = context()
    const error = new Error('test')

    const err = ctx.createError(error)
    assert.strictEqual(err.status, 500)
    assert.strictEqual(err.message, 'test')
    assert.strictEqual(err.expose, false)
  })
})

tman.suite('ctx.createError(status, err)', function () {
  tman.it('should create the error and set .status', function () {
    const ctx = context()
    const error = new Error('test')

    const err = ctx.createError(422, error)
    assert.strictEqual(err.status, 422)
    assert.strictEqual(err.message, 'test')
    assert.strictEqual(err.expose, true)
  })
})

tman.suite('ctx.createError(status, msg)', function () {
  tman.it('should create an error', function () {
    const ctx = context()

    const err = ctx.createError(400, 'name required')
    assert.strictEqual(err.message, 'name required')
    assert.strictEqual(err.status, 400)
    assert.strictEqual(err.expose, true)
  })
})

tman.suite('ctx.createError(status)', function () {
  tman.it('should create an error', function () {
    const ctx = context()

    const err = ctx.createError(400)
    assert.strictEqual(err.message, 'Bad Request')
    assert.strictEqual(err.status, 400)
    assert.strictEqual(err.expose, true)
  })
})

tman.suite('ctx.createError(status, msg, props)', function () {
  tman.it('should mixin props', function () {
    const ctx = context()
    const err = ctx.createError(400, 'msg', {
      prop: true
    })
    assert.strictEqual(err.message, 'msg')
    assert.strictEqual(err.status, 400)
    assert.strictEqual(err.expose, true)
    assert.strictEqual(err.prop, true)
  })

  tman.suite('when props include status', function () {
    tman.it('should be ignored', function () {
      const ctx = context()

      const err = ctx.createError(400, 'msg', {
        prop: true,
        status: -1
      })
      assert.strictEqual(err.message, 'msg')
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.expose, true)
      assert.strictEqual(err.prop, true)
    })
  })
})

tman.suite('ctx.createError(msg, props)', function () {
  tman.it('should mixin props', function () {
    const ctx = context()

    const err = ctx.createError('msg', {
      prop: true
    })
    assert.strictEqual(err.message, 'msg')
    assert.strictEqual(err.status, 500)
    assert.strictEqual(err.expose, false)
    assert.strictEqual(err.prop, true)
  })
})

tman.suite('ctx.createError(status, props)', function () {
  tman.it('should mixin props', function () {
    const ctx = context()

    const err = ctx.createError(400, {
      prop: true
    })
    assert.strictEqual(err.message, 'Bad Request')
    assert.strictEqual(err.status, 400)
    assert.strictEqual(err.expose, true)
    assert.strictEqual(err.prop, true)
  })
})

tman.suite('ctx.createError(err, props)', function () {
  tman.it('should mixin props', function () {
    const ctx = context()

    const err = ctx.createError(new Error('test'), {
      prop: true
    })
    assert.strictEqual(err.message, 'test')
    assert.strictEqual(err.status, 500)
    assert.strictEqual(err.expose, false)
    assert.strictEqual(err.prop, true)
  })
})
