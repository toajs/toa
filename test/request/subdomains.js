'use strict'

const tman = require('tman')
const assert = require('assert')
const request = require('../context').request

tman.suite('req.subdomains', function () {
  tman.it('should return subdomain array', function () {
    const req = request()
    req.header.host = 'tobi.ferrets.example.com'
    req.ctx.config.subdomainOffset = 2
    assert.deepStrictEqual(req.subdomains, ['ferrets', 'tobi'])

    req.ctx.config.subdomainOffset = 3
    assert.deepStrictEqual(req.subdomains, ['tobi'])
  })

  tman.it('should work with no host present', function () {
    const req = request()
    assert.deepStrictEqual(req.subdomains, [])
  })

  tman.it('should check if the host is an ip address, even with a port', function () {
    const req = request()
    req.header.host = '127.0.0.1:3000'
    assert.deepStrictEqual(req.subdomains, [])
  })
})
