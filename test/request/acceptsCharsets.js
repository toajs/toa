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

describe('ctx.acceptsCharsets()', function() {
  describe('with no arguments', function() {
    describe('when Accept-Charset is populated', function() {
      it('should return accepted types', function() {
        var ctx = context();
        ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
        assert.deepEqual(ctx.acceptsCharsets(), ['utf-8', 'utf-7', 'iso-8859-1']);
      });
    });
  });

  describe('with multiple arguments', function() {
    describe('when Accept-Charset is populated', function() {
      describe('if any types match', function() {
        it('should return the best fit', function() {
          var ctx = context();
          ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
          assert(ctx.acceptsCharsets('utf-7', 'utf-8') === 'utf-8');
        });
      });

      describe('if no types match', function() {
        it('should return false', function() {
          var ctx = context();
          ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
          assert(ctx.acceptsCharsets('utf-16') === false);
        });
      });
    });

    describe('when Accept-Charset is not populated', function() {
      it('should return the first type', function() {
        var ctx = context();
        assert(ctx.acceptsCharsets('utf-7', 'utf-8') === 'utf-7');
      });
    });
  });

  describe('with an array', function() {
    it('should return the best fit', function() {
      var ctx = context();
      ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
      assert(ctx.acceptsCharsets(['utf-7', 'utf-8']) === 'utf-8');
    });
  });
});
