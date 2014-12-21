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

describe('req.hostname', function() {
  it('should return hostname void of port', function() {
    var req = request();
    req.header.host = 'foo.com:3000';
    assert(req.hostname === 'foo.com');
  });

  describe('with no host present', function() {
    it('should return null', function() {
      var req = request();
      assert(req.hostname == null);
    });
  });

  describe('when X-Forwarded-Host is present', function() {
    describe('and proxy is not trusted', function() {
      it('should be ignored', function() {
        var req = request();
        req.header['x-forwarded-host'] = 'bar.com';
        req.header.host = 'foo.com';
        assert(req.hostname === 'foo.com');
      });
    });

    describe('and proxy is trusted', function() {
      it('should be used', function() {
        var req = request();
        req.ctx.config.proxy = true;
        req.header['x-forwarded-host'] = 'bar.com, baz.com';
        req.header.host = 'foo.com';
        assert(req.hostname === 'bar.com');
      });
    });
  });
});
