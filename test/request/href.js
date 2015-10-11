'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var Stream = require('stream')
var request = require('supertest')
var assert = require('assert')
var toa = require('../../')
var context = require('../context')

describe('ctx.href', function () {
  it('should return the full request url', function () {
    var socket = new Stream.Duplex()
    var req = {
      url: '/users/1?next=dashboard',
      headers: {
        host: 'localhost'
      },
      socket: socket,
      __proto__: Stream.Readable.prototype
    }
    var ctx = context(req)
    assert.strictEqual(ctx.href, 'http://localhost/users/1?next=dashboard')
    // change it also work
    ctx.url = '/foo/users/1?next=/dashboard'
    assert.strictEqual(ctx.href, 'http://localhost/users/1?next=dashboard')
  })

  it('should work with `GET /users/1?next=dashboard`', function () {
    var app = toa(function () {
      this.body = this.href
      assert.strictEqual(this.body, this.protocol + '://' + this.host + '/users/1?next=dashboard')
    })

    return request(app.listen())
      .get('/users/1?next=dashboard')
      .expect(200)
  })

  it('should work with `GET http://example.com/foo`', function () {
    var ctx = context()
    ctx.originalUrl = ctx.request.originalUrl = ctx.req.url = 'http://example.com/foo'
    assert.strictEqual(ctx.request.href, 'http://example.com/foo')
    assert.strictEqual(ctx.href, 'http://example.com/foo')
  })
})
