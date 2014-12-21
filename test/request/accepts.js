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

describe('ctx.accepts(types)', function() {
  describe('with no arguments', function() {
    describe('when Accept is populated', function() {
      it('should return all accepted types', function() {
        var ctx = context();
        ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain';
        assert.deepEqual(ctx.accepts(), ['text/html', 'text/plain', 'image/jpeg', 'application/*']);
      });
    });
  });

  describe('with no valid types', function() {
    describe('when Accept is populated', function() {
      it('should return false', function() {
        var ctx = context();
        ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain';
        assert(ctx.accepts('image/png', 'image/tiff') === false);
      });
    });

    describe('when Accept is not populated', function() {
      it('should return the first type', function() {
        var ctx = context();
        assert(ctx.accepts('text/html', 'text/plain', 'image/jpeg', 'application/*') === 'text/html');
      });
    });
  });

  describe('when extensions are given', function() {
    it('should convert to mime types', function() {
      var ctx = context();
      ctx.req.headers.accept = 'text/plain, text/html';
      assert(ctx.accepts('html') === 'html');
      assert(ctx.accepts('.html') === '.html');
      assert(ctx.accepts('txt') === 'txt');
      assert(ctx.accepts('.txt') === '.txt');
      assert(ctx.accepts('png') === false);
    });
  });

  describe('when an array is given', function() {
    it('should return the first match', function() {
      var ctx = context();
      ctx.req.headers.accept = 'text/plain, text/html';
      assert(ctx.accepts(['png', 'text', 'html']) === 'text');
      assert(ctx.accepts(['png', 'html']) === 'html');
    });
  });

  describe('when multiple arguments are given', function() {
    it('should return the first match', function() {
      var ctx = context();
      ctx.req.headers.accept = 'text/plain, text/html';
      assert(ctx.accepts('png', 'text', 'html') === 'text');
      assert(ctx.accepts('png', 'html') === 'html');
    });
  });

  describe('when present in Accept as an exact match', function() {
    it('should return the type', function() {
      var ctx = context();
      ctx.req.headers.accept = 'text/plain, text/html';
      assert(ctx.accepts('text/html') === 'text/html');
      assert(ctx.accepts('text/plain') === 'text/plain');
    });
  });

  describe('when present in Accept as a type match', function() {
    it('should return the type', function() {
      var ctx = context();
      ctx.req.headers.accept = 'application/json, */*';
      assert(ctx.accepts('text/html') === 'text/html');
      assert(ctx.accepts('text/plain') === 'text/plain');
      assert(ctx.accepts('image/png') === 'image/png');
    });
  });

  describe('when present in Accept as a subtype match', function() {
    it('should return the type', function() {
      var ctx = context();
      ctx.req.headers.accept = 'application/json, text/*';
      assert(ctx.accepts('text/html') === 'text/html');
      assert(ctx.accepts('text/plain') === 'text/plain');
      assert(ctx.accepts('image/png') === false);
    });
  });
});
