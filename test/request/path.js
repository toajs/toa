'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it */

var assert = require('assert')
var context = require('../context')

describe('ctx.path', function () {
  it('should return the pathname', function () {
    var ctx = context()
    ctx.url = '/login?next=/dashboard'
    assert(ctx.path === '/login')
  })
})

describe('ctx.path=', function () {
  it('should set the pathname', function () {
    var ctx = context()
    ctx.url = '/login?next=/dashboard'

    ctx.path = '/logout'
    assert(ctx.path === '/logout')
    assert(ctx.url === '/logout?next=/dashboard')
  })

  it('should change .url but not .originalUrl', function () {
    var ctx = context({url: '/login' })
    ctx.path = '/logout'
    assert(ctx.url === '/logout')
    assert(ctx.originalUrl === '/login')
    assert(ctx.request.originalUrl === '/login')
  })
})
