'use strict'

const tman = require('tman')
const Stream = require('stream')
const request = require('supertest')
const assert = require('assert')
const toa = require('../../')
const context = require('../context')

tman.suite('ctx.href', function () {
  tman.it('should return the full request url', function () {
    let socket = new Stream.Duplex()
    let req = {
      url: '/users/1?next=dashboard',
      headers: {
        host: 'localhost'
      },
      socket: socket,
      __proto__: Stream.Readable.prototype
    }
    let ctx = context(req)
    assert.strictEqual(ctx.href, 'http://localhost/users/1?next=dashboard')
    // change it also work
    ctx.url = '/foo/users/1?next=/dashboard'
    assert.strictEqual(ctx.href, 'http://localhost/users/1?next=dashboard')
  })

  tman.it('should work with `GET /users/1?next=dashboard`', function () {
    const app = toa(function () {
      this.body = this.href
      assert.strictEqual(this.body, this.protocol + '://' + this.host + '/users/1?next=dashboard')
    })

    return request(app.listen())
      .get('/users/1?next=dashboard')
      .expect(200)
  })

  tman.it('should work with `GET http://example.com/foo`', function () {
    let ctx = context()
    ctx.originalUrl = ctx.request.originalUrl = ctx.req.url = 'http://example.com/foo'
    assert.strictEqual(ctx.request.href, 'http://example.com/foo')
    assert.strictEqual(ctx.href, 'http://example.com/foo')
  })
})
