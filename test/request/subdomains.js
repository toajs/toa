'use strict'

var tman = require('tman')
var assert = require('assert')
var request = require('../context').request

tman.suite('req.subdomains', function () {
  tman.it('should return subdomain array', function () {
    var req = request()
    req.header.host = 'tobi.ferrets.example.com'
    req.ctx.config.subdomainOffset = 2
    assert.deepEqual(req.subdomains, ['ferrets', 'tobi'])

    req.ctx.config.subdomainOffset = 3
    assert.deepEqual(req.subdomains, ['tobi'])
  })

  tman.it('should work with no host present', function () {
    var req = request()
    assert.deepEqual(req.subdomains, [])
  })

  tman.it('should check if the host is an ip address, even with a port', function () {
    var req = request()
    req.header.host = '127.0.0.1:3000'
    assert.deepEqual(req.subdomains, [])
  })
})
