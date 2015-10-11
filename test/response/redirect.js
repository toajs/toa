'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var context = require('../context')

describe('ctx.redirect(url)', function () {
  it('should redirect to the given url', function () {
    var ctx = context()
    ctx.redirect('http://google.com')
    assert.strictEqual(ctx.response.header.location, 'http://google.com')
    assert.strictEqual(ctx.status, 302)
  })

  describe('with "back"', function () {
    it('should redirect to Referrer', function () {
      var ctx = context()
      ctx.req.headers.referrer = '/login'
      ctx.redirect('back')
      assert.strictEqual(ctx.response.header.location, '/login')
    })

    it('should redirect to Referer', function () {
      var ctx = context()
      ctx.req.headers.referer = '/login'
      ctx.redirect('back')
      assert.strictEqual(ctx.response.header.location, '/login')
    })

    it('should default to alt', function () {
      var ctx = context()
      ctx.redirect('back', '/index.html')
      assert.strictEqual(ctx.response.header.location, '/index.html')
    })

    it('should default redirect to /', function () {
      var ctx = context()
      ctx.redirect('back')
      assert.strictEqual(ctx.response.header.location, '/')
    })
  })

  describe('when html is accepted', function () {
    it('should respond with html', function () {
      var ctx = context()
      var url = 'http://google.com'
      ctx.header.accept = 'text/html'
      ctx.redirect(url)
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=utf-8')
      assert.strictEqual(ctx.body, 'Redirecting to <a href="' + url + '">' + url + '</a>.')
    })

    it('should escape the url', function () {
      var ctx = context()
      var url = '<script>'
      ctx.header.accept = 'text/html'
      ctx.redirect(url)
      url = escape(url)
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=utf-8')
      assert.strictEqual(ctx.body, 'Redirecting to <a href="' + url + '">' + url + '</a>.')
    })
  })

  describe('when text is accepted', function () {
    it('should respond with text', function () {
      var ctx = context()
      var url = 'http://google.com'
      ctx.header.accept = 'text/plain'
      ctx.redirect(url)
      assert.strictEqual(ctx.body, 'Redirecting to ' + url + '.')
    })
  })

  describe('when status is 301', function () {
    it('should not change the status code', function () {
      var ctx = context()
      var url = 'http://google.com'
      ctx.status = 301
      ctx.header.accept = 'text/plain'
      ctx.redirect('http://google.com')
      assert.strictEqual(ctx.status, 301)
      assert.strictEqual(ctx.body, 'Redirecting to ' + url + '.')
    })
  })

  describe('when status is 304', function () {
    it('should change the status code', function () {
      var ctx = context()
      var url = 'http://google.com'
      ctx.status = 304
      ctx.header.accept = 'text/plain'
      ctx.redirect('http://google.com')
      assert.strictEqual(ctx.status, 302)
      assert.strictEqual(ctx.body, 'Redirecting to ' + url + '.')
    })
  })

  describe('when content-type was present', function () {
    it('should overwrite content-type', function () {
      var ctx = context()
      ctx.body = {}
      var url = 'http://google.com'
      ctx.header.accept = 'text/plain'
      ctx.redirect('http://google.com')
      assert.strictEqual(ctx.status, 302)
      assert.strictEqual(ctx.body, 'Redirecting to ' + url + '.')
      assert.strictEqual(ctx.type, 'text/plain')
    })
  })
})

function escape (html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
