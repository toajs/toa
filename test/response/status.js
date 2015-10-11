'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it, before */

var assert = require('assert')
var response = require('../context').response
var request = require('supertest')
var statuses = require('statuses')
var toa = require('../..')

describe('res.status=', function () {
  describe('when a status code', function () {
    describe('and valid', function () {
      it('should set the status', function () {
        var res = response()
        res.status = 403
        assert.strictEqual(res.status, 403)
      })

      it('should not throw', function () {
        assert.doesNotThrow(function () {
          response().status = 403
        })
      })
    })

    describe('and invalid', function () {
      it('should throw', function () {
        assert.throws(function () {
          response().status = 999
        }, 'invalid status code: 999')
      })
    })

    describe('and custom status', function () {
      before(function () {
        statuses['700'] = 'custom status'
      })

      it('should set the status', function () {
        var res = response()
        res.status = 700
        assert.strictEqual(res.status, 700)
      })

      it('should not throw', function () {
        assert.doesNotThrow(function () {
          response().status = 700
        })
      })
    })
  })

  describe('when a status string', function () {
    it('should throw', function () {
      assert.throws(function () {
        response().status = 'forbidden'
      }, 'status code must be a number')
    })
  })

  function strip (status) {
    it('should strip content related header fields', function () {
      var app = toa()

      app.use(function (next) {
        this.body = {
          foo: 'bar'
        }
        this.set('Content-Type', 'application/json; charset=utf-8')
        this.set('Content-Length', '15')
        this.set('Transfer-Encoding', 'chunked')
        this.status = status
        assert.strictEqual(this.response.header['content-type'] == null, true)
        assert.strictEqual(this.response.header['content-length'] == null, true)
        assert.strictEqual(this.response.header['transfer-encoding'] == null, true)
        return next()
      })

      return request(app.listen())
        .get('/')
        .expect(status)
        .expect(function (res) {
          assert.strictEqual(res.header['content-type'] == null, true)
          assert.strictEqual(res.header['content-length'] == null, true)
          assert.strictEqual(res.header['content-encoding'] == null, true)
          assert.strictEqual(res.text.length, 0)
        })
    })

    it('should strip content releated header fields after status set', function () {
      var app = toa()

      app.use(function (next) {
        this.status = status
        this.body = {
          foo: 'bar'
        }
        this.set('Content-Type', 'application/json; charset=utf-8')
        this.set('Content-Length', '15')
        this.set('Transfer-Encoding', 'chunked')
        return next()
      })

      return request(app.listen())
        .get('/')
        .expect(status)
        .expect(function (res) {
          assert.strictEqual(res.header['content-type'] == null, true)
          assert.strictEqual(res.header['content-length'] == null, true)
          assert.strictEqual(res.header['content-encoding'] == null, true)
          assert.strictEqual(res.text.length, 0)
        })
    })
  }

  describe('when 204', function () {
    strip(204)
  })

  describe('when 205', function () {
    strip(205)
  })

  describe('when 304', function () {
    strip(304)
  })
})
