'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('supertest')
const Toa = require('../..')

tman.suite('catch error', function () {
  tman.it('should respond', function () {
    const app = new Toa()

    app.use(function (next) {
      this.body = 'something else'

      this.throw(418, 'boom')
      return next()
    })

    return request(app.listen())
      .get('/')
      .expect(418)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Content-Length', '4')
  })

  tman.it('should unset all headers', function () {
    const app = new Toa()

    app.use(function (next) {
      this.set('Vary', 'Accept-Encoding')
      this.set('X-CSRF-Token', 'asdf')
      this.body = 'response'

      this.throw(418, 'boom')
      return next()
    })

    return request(app.listen())
      .get('/')
      .expect(418)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Content-Length', '4')
      .expect(function (res) {
        assert.strictEqual(res.headers.vary, undefined)
        assert.strictEqual(res.headers['x-csrf-token'], undefined)
      })
  })

  tman.suite('when invalid err.status', function () {
    tman.suite('not number', function () {
      tman.it('should respond 500', function () {
        const app = new Toa()

        app.use(function (next) {
          this.body = 'something else'
          let err = new Error('some error')
          err.status = 'notnumber'
          throw err
        })

        app.onerror = function () {}

        return request(app.listen())
          .get('/')
          .expect(500)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect('Internal Server Error')
      })
    })

    tman.suite('not http status code', function () {
      tman.it('should respond 500', function () {
        const app = new Toa()

        app.use(function (next) {
          this.body = 'something else'
          let err = new Error('some error')
          err.status = 9999
          throw err
        })

        app.onerror = function () {}

        return request(app.listen())
          .get('/')
          .expect(500)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect('Internal Server Error')
      })
    })
  })
})
