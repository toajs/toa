'use strict';
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it, before, after, beforeEach, afterEach*/

/*jshint -W124 */

var assert = require('assert');
var request = require('../context').request;

describe('req.subdomains', function() {
  it('should return subdomain array', function() {
    var req = request();
    req.header.host = 'tobi.ferrets.example.com';
    req.ctx.config.subdomainOffset = 2;
    assert.deepEqual(req.subdomains, ['ferrets', 'tobi']);

    req.ctx.config.subdomainOffset = 3;
    assert.deepEqual(req.subdomains, ['tobi']);
  });

  describe('with no host present', function() {
    var req = request();
    assert.deepEqual(req.subdomains, []);
  });
});
