'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var context = require('../context')

describe('ctx.throw(msg)', function () {
  it('should set .status to 500', function (done) {
    var ctx = context()

    try {
      ctx.throw('boom')
    } catch (err) {
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.expose, false)
      done()
    }
  })
})

describe('ctx.throw(err)', function () {
  it('should set .status to 500', function (done) {
    var ctx = context()
    var err = new Error('test')

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

describe('ctx.throw(err, status)', function () {
  it('should throw the error and set .status', function (done) {
    var ctx = context()
    var error = new Error('test')

    try {
      ctx.throw(error, 422)
    } catch (err) {
      assert.strictEqual(err.status, 422)
      assert.strictEqual(err.message, 'test')
      assert.strictEqual(err.expose, true)
      done()
    }
  })
})

describe('ctx.throw(status, err)', function () {
  it('should throw the error and set .status', function (done) {
    var ctx = context()
    var error = new Error('test')

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

describe('ctx.throw(msg, status)', function () {
  it('should throw an error', function (done) {
    var ctx = context()

    try {
      ctx.throw('name required', 400)
    } catch (err) {
      assert.strictEqual(err.message, 'name required')
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.expose, true)
      done()
    }
  })
})

describe('ctx.throw(status, msg)', function () {
  it('should throw an error', function (done) {
    var ctx = context()

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

describe('ctx.throw(status)', function () {
  it('should throw an error', function (done) {
    var ctx = context()

    try {
      ctx.throw(400)
    } catch (err) {
      assert.strictEqual(err.message, 'Bad Request')
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.expose, true)
      done()
    }
  })

  describe('when not valid status', function () {
    it('should not expose', function (done) {
      var ctx = context()

      try {
        var err = new Error('some error')
        err.status = -1
        ctx.throw(err)
      } catch (err) {
        assert.strictEqual(err.message, 'some error')
        assert.strictEqual(err.expose, false)
        done()
      }
    })
  })
})

describe('ctx.throw(status, msg, props)', function () {
  it('should mixin props', function (done) {
    var ctx = context()

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

  describe('when props include status', function () {
    it('should be ignored', function (done) {
      var ctx = context()

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

describe('ctx.throw(msg, props)', function () {
  it('should mixin props', function (done) {
    var ctx = context()

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

describe('ctx.throw(status, props)', function () {
  it('should mixin props', function (done) {
    var ctx = context()

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

describe('ctx.throw(err, props)', function () {
  it('should mixin props', function (done) {
    var ctx = context()

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
