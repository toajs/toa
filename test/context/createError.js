'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var context = require('../context')

describe('ctx.createError(msg)', function () {
  it('should set .status to 500', function () {
    var ctx = context()

    var err = ctx.createError('boom')
    assert.strictEqual(err.status, 500)
    assert.strictEqual(err.expose, false)
  })
})

describe('ctx.createError(err)', function () {
  it('should set .status to 500', function () {
    var ctx = context()
    var error = new Error('test')

    var err = ctx.createError(error)
    assert.strictEqual(err.status, 500)
    assert.strictEqual(err.message, 'test')
    assert.strictEqual(err.expose, false)
  })
})

describe('ctx.createError(err, status)', function () {
  it('should create the error and set .status', function () {
    var ctx = context()
    var error = new Error('test')

    var err = ctx.createError(error, 422)
    assert.strictEqual(err.status, 422)
    assert.strictEqual(err.message, 'test')
    assert.strictEqual(err.expose, true)
  })
})

describe('ctx.createError(status, err)', function () {
  it('should create the error and set .status', function () {
    var ctx = context()
    var error = new Error('test')

    var err = ctx.createError(422, error)
    assert.strictEqual(err.status, 422)
    assert.strictEqual(err.message, 'test')
    assert.strictEqual(err.expose, true)
  })
})

describe('ctx.createError(msg, status)', function () {
  it('should create an error', function () {
    var ctx = context()

    var err = ctx.createError('name required', 400)
    assert.strictEqual(err.message, 'name required')
    assert.strictEqual(err.status, 400)
    assert.strictEqual(err.expose, true)
  })
})

describe('ctx.createError(status, msg)', function () {
  it('should create an error', function () {
    var ctx = context()

    var err = ctx.createError(400, 'name required')
    assert.strictEqual(err.message, 'name required')
    assert.strictEqual(err.status, 400)
    assert.strictEqual(err.expose, true)
  })
})

describe('ctx.createError(status)', function () {
  it('should create an error', function () {
    var ctx = context()

    var err = ctx.createError(400)
    assert.strictEqual(err.message, 'Bad Request')
    assert.strictEqual(err.status, 400)
    assert.strictEqual(err.expose, true)
  })

  describe('when not valid status', function () {
    it('should not expose', function () {
      var ctx = context()

      var error = new Error('some error')
      error.status = -1
      var err = ctx.createError(error)
      assert.strictEqual(err.message, 'some error')
      assert.strictEqual(err.expose, false)
    })
  })
})

describe('ctx.createError(status, msg, props)', function () {
  it('should mixin props', function () {
    var ctx = context()

    var err = ctx.createError(400, 'msg', {
      prop: true
    })
    assert.strictEqual(err.message, 'msg')
    assert.strictEqual(err.status, 400)
    assert.strictEqual(err.expose, true)
    assert.strictEqual(err.prop, true)
  })

  describe('when props include status', function () {
    it('should be ignored', function () {
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

describe('ctx.createError(msg, props)', function () {
  it('should mixin props', function () {
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

describe('ctx.createError(status, props)', function () {
  it('should mixin props', function () {
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

describe('ctx.createError(err, props)', function () {
  it('should mixin props', function () {
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
