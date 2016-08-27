'use strict'

var tman = require('tman')
var assert = require('assert')
var context = require('../context')

tman.suite('ctx.createError(msg)', function () {
  tman.it('should set .status to 500', function () {
    var ctx = context()

    var err = ctx.createError('boom')
    assert.strictEqual(err.status, 500)
    assert.strictEqual(err.expose, false)
  })
})

tman.suite('ctx.createError(err)', function () {
  tman.it('should set .status to 500', function () {
    var ctx = context()
    var error = new Error('test')

    var err = ctx.createError(error)
    assert.strictEqual(err.status, 500)
    assert.strictEqual(err.message, 'test')
    assert.strictEqual(err.expose, false)
  })
})

tman.suite('ctx.createError(err, status)', function () {
  tman.it('should create the error and set .status', function () {
    var ctx = context()
    var error = new Error('test')

    var err = ctx.createError(error, 422)
    assert.strictEqual(err.status, 422)
    assert.strictEqual(err.message, 'test')
    assert.strictEqual(err.expose, true)
  })
})

tman.suite('ctx.createError(status, err)', function () {
  tman.it('should create the error and set .status', function () {
    var ctx = context()
    var error = new Error('test')

    var err = ctx.createError(422, error)
    assert.strictEqual(err.status, 422)
    assert.strictEqual(err.message, 'test')
    assert.strictEqual(err.expose, true)
  })
})

tman.suite('ctx.createError(msg, status)', function () {
  tman.it('should create an error', function () {
    var ctx = context()

    var err = ctx.createError('name required', 400)
    assert.strictEqual(err.message, 'name required')
    assert.strictEqual(err.status, 400)
    assert.strictEqual(err.expose, true)
  })
})

tman.suite('ctx.createError(status, msg)', function () {
  tman.it('should create an error', function () {
    var ctx = context()

    var err = ctx.createError(400, 'name required')
    assert.strictEqual(err.message, 'name required')
    assert.strictEqual(err.status, 400)
    assert.strictEqual(err.expose, true)
  })
})

tman.suite('ctx.createError(status)', function () {
  tman.it('should create an error', function () {
    var ctx = context()

    var err = ctx.createError(400)
    assert.strictEqual(err.message, 'Bad Request')
    assert.strictEqual(err.status, 400)
    assert.strictEqual(err.expose, true)
  })

  tman.suite('when not valid status', function () {
    tman.it('should not expose', function () {
      var ctx = context()

      var error = new Error('some error')
      error.status = -1
      var err = ctx.createError(error)
      assert.strictEqual(err.message, 'some error')
      assert.strictEqual(err.expose, false)
    })
  })
})

tman.suite('ctx.createError(status, msg, props)', function () {
  tman.it('should mixin props', function () {
    var ctx = context()

    var err = ctx.createError(400, 'msg', {
      prop: true
    })
    assert.strictEqual(err.message, 'msg')
    assert.strictEqual(err.status, 400)
    assert.strictEqual(err.expose, true)
    assert.strictEqual(err.prop, true)
  })

  tman.suite('when props include status', function () {
    tman.it('should be ignored', function () {
      var ctx = context()

      var err = ctx.createError(400, 'msg', {
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
    var ctx = context()

    var err = ctx.createError('msg', {
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
    var ctx = context()

    var err = ctx.createError(400, {
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
    var ctx = context()

    var err = ctx.createError(new Error('test'), {
      prop: true
    })
    assert.strictEqual(err.message, 'test')
    assert.strictEqual(err.status, 500)
    assert.strictEqual(err.expose, false)
    assert.strictEqual(err.prop, true)
  })
})
