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

  tman.it('with no host present', function () {
    var req = request()
    assert.deepEqual(req.subdomains, [])
  })
})
