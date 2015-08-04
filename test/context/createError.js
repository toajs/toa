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
  it('should set .status to 500', function (done) {
    var ctx = context()

    var err = ctx.createError('boom')
    assert(err.status === 500)
    assert(!err.expose)
    done()
  })
})

describe('ctx.createError(err)', function () {
  it('should set .status to 500', function (done) {
    var ctx = context()
    var error = new Error('test')

    var err = ctx.createError(error)
    assert(err.status === 500)
    assert(err.message === 'test')
    assert(!err.expose)
    done()
  })
})

describe('ctx.createError(err, status)', function () {
  it('should create the error and set .status', function (done) {
    var ctx = context()
    var error = new Error('test')

    var err = ctx.createError(error, 422)
    assert(err.status === 422)
    assert(err.message === 'test')
    assert(err.expose === true)
    done()
  })
})

describe('ctx.createError(status, err)', function () {
  it('should create the error and set .status', function (done) {
    var ctx = context()
    var error = new Error('test')

    var err = ctx.createError(422, error)
    assert(err.status === 422)
    assert(err.message === 'test')
    assert(err.expose)
    done()
  })
})

describe('ctx.createError(msg, status)', function () {
  it('should create an error', function (done) {
    var ctx = context()

    var err = ctx.createError('name required', 400)
    assert(err.message === 'name required')
    assert(err.status === 400)
    assert(err.expose)
    done()
  })
})

describe('ctx.createError(status, msg)', function () {
  it('should create an error', function (done) {
    var ctx = context()

    var err = ctx.createError(400, 'name required')
    assert(err.message === 'name required')
    assert(err.status === 400)
    assert(err.expose)
    done()
  })
})

describe('ctx.createError(status)', function () {
  it('should create an error', function (done) {
    var ctx = context()

    var err = ctx.createError(400)
    assert(err.message === 'Bad Request')
    assert(err.status === 400)
    assert(err.expose)
    done()
  })

  describe('when not valid status', function () {
    it('should not expose', function (done) {
      var ctx = context()

      var error = new Error('some error')
      error.status = -1
      var err = ctx.createError(error)
      assert(err.message === 'some error')
      assert(!err.expose)
      done()
    })
  })
})

describe('ctx.createError(status, msg, props)', function () {
  it('should mixin props', function (done) {
    var ctx = context()

    var err = ctx.createError(400, 'msg', {
      prop: true
    })
    assert(err.message === 'msg')
    assert(err.status === 400)
    assert(err.expose)
    assert(err.prop)
    done()
  })

  describe('when props include status', function () {
    it('should be ignored', function (done) {
      var ctx = context()

      var err = ctx.createError(400, 'msg', {
        prop: true,
        status: -1
      })
      assert(err.message === 'msg')
      assert(err.status === 400)
      assert(err.expose)
      assert(err.prop)
      done()
    })
  })
})

describe('ctx.createError(msg, props)', function () {
  it('should mixin props', function (done) {
    var ctx = context()

    var err = ctx.createError('msg', {
      prop: true
    })
    assert(err.message === 'msg')
    assert(err.status === 500)
    assert(err.expose === false)
    assert(err.prop)
    done()
  })
})

describe('ctx.createError(status, props)', function () {
  it('should mixin props', function (done) {
    var ctx = context()

    var err = ctx.createError(400, {
      prop: true
    })
    assert(err.message === 'Bad Request')
    assert(err.status === 400)
    assert(err.expose)
    assert(err.prop)
    done()
  })
})

describe('ctx.createError(err, props)', function () {
  it('should mixin props', function (done) {
    var ctx = context()

    var err = ctx.createError(new Error('test'), {
      prop: true
    })
    assert(err.message === 'test')
    assert(err.status === 500)
    assert(err.expose === false)
    assert(err.prop)
    done()
  })
})
