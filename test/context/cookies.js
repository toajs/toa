'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('supertest')
const Toa = require('../..')

tman.suite('ctx.cookies.set()', function () {
  tman.it('should set an unsigned cookie', function () {
    const app = new Toa()

    app.use(function (next) {
      this.cookies.set('name', 'jon')
      this.status = 204
      return next()
    })

    return request(app.listen())
      .get('/')
      .expect(204)
      .expect(function (res) {
        assert.strictEqual(res.headers['set-cookie'].some(function (cookie) {
          return /^name=/.test(cookie)
        }), true)
      })
  })

  tman.suite('with .signed', function () {
    tman.suite('when no .keys are set', function () {
      tman.it('should error', function () {
        const app = new Toa()
        app.keys = null

        app.use(function (next) {
          try {
            this.cookies.set('foo', 'bar', {
              signed: true
            })
          } catch (err) {
            this.body = err.message
          }
          return next()
        })

        return request(app.listen())
          .get('/')
          .expect('.keys required for signed cookies')
      })
    })

    tman.it('should send a signed cookie', function () {
      const app = new Toa()
      app.keys = ['Toa']

      app.use(function (next) {
        this.cookies.set('name', 'jon', {
          signed: true
        })
        this.status = 204
        return next()
      })

      return request(app.listen())
        .get('/')
        .expect(204)
        .expect(function (res) {
          let cookies = res.headers['set-cookie']

          assert.strictEqual(cookies.some(function (cookie) {
            return /^name=/.test(cookie)
          }), true)

          assert.strictEqual(cookies.some(function (cookie) {
            return /^name\.sig=/.test(cookie)
          }), true)
        })
    })
  })
})
