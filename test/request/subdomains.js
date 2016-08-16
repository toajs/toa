'use strict'
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global suite, it */

var assert = require('assert')
var request = require('../context').request

suite('req.subdomains', function () {
  it('should return subdomain array', function () {
    var req = request()
    req.header.host = 'tobi.ferrets.example.com'
    req.ctx.config.subdomainOffset = 2
    assert.deepEqual(req.subdomains, ['ferrets', 'tobi'])

    req.ctx.config.subdomainOffset = 3
    assert.deepEqual(req.subdomains, ['tobi'])
  })

  suite('with no host present', function () {
    var req = request()
    assert.deepEqual(req.subdomains, [])
  })
})
