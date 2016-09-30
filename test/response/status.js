'use strict'

const tman = require('tman')
const assert = require('assert')
const response = require('../context').response
const request = require('supertest')
const statuses = require('statuses')
const Toa = require('../..')

tman.suite('res.status=', function () {
  tman.suite('when a status code', function () {
    tman.suite('and valid', function () {
      tman.it('should set the status', function () {
        let res = response()
        res.status = 403
        assert.strictEqual(res.status, 403)
      })

      tman.it('should not throw', function () {
        assert.doesNotThrow(function () {
          response().status = 403
        })
      })
    })

    tman.suite('and invalid', function () {
      tman.it('should throw', function () {
        assert.throws(function () {
          response().status = 999
        }, 'invalid status code: 999')
      })
    })

    tman.suite('and custom status', function () {
      tman.before(function () {
        statuses['700'] = 'custom status'
      })

      tman.it('should set the status', function () {
        let res = response()
        res.status = 700
        assert.strictEqual(res.status, 700)
      })

      tman.it('should not throw', function () {
        assert.doesNotThrow(function () {
          response().status = 700
        })
      })
    })
  })

  tman.suite('when a status string', function () {
    tman.it('should throw', function () {
      assert.throws(function () {
        response().status = 'forbidden'
      }, 'status code must be a number')
    })
  })

  function strip (status) {
    tman.it('should strip content related header fields', function () {
      const app = new Toa()

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

    tman.it('should strip content releated header fields after status set', function () {
      const app = new Toa()

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

  tman.suite('when 204', function () {
    strip(204)
  })

  tman.suite('when 205', function () {
    strip(205)
  })

  tman.suite('when 304', function () {
    strip(304)
  })
})
