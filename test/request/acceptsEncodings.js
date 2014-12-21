'use strict';
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it, before, after, beforeEach, afterEach*/

/*jshint -W124 */

var assert = require('assert');
var context = require('../context');

describe('ctx.acceptsEncodings()', function() {
  describe('with no arguments', function() {
    describe('when Accept-Encoding is populated', function() {
      it('should return accepted types', function() {
        var ctx = context();
        ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2';
        assert.deepEqual(ctx.acceptsEncodings(), ['gzip', 'compress', 'identity']);
        assert(ctx.acceptsEncodings('gzip', 'compress') === 'gzip');
      });
    });

    describe('when Accept-Encoding is not populated', function() {
      it('should return identity', function() {
        var ctx = context();
        assert.deepEqual(ctx.acceptsEncodings(), ['identity']);
        assert(ctx.acceptsEncodings('gzip', 'deflate', 'identity') === 'identity');
      });
    });
  });

  describe('with multiple arguments', function() {
    it('should return the best fit', function() {
      var ctx = context();
      ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2';
      assert.deepEqual(ctx.acceptsEncodings('compress', 'gzip'), 'gzip');
      assert.deepEqual(ctx.acceptsEncodings('gzip', 'compress'), 'gzip');
    });
  });

  describe('with an array', function() {
    it('should return the best fit', function() {
      var ctx = context();
      ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2';
      assert.deepEqual(ctx.acceptsEncodings(['compress', 'gzip']), 'gzip');
    });
  });
});
