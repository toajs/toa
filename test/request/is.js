'use strict';
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it, before, after, beforeEach, afterEach*/

/*jshint -W124 */

var context = require('../context');
var assert = require('assert');

describe('ctx.is(type)', function() {
  it('should ignore params', function() {
    var ctx = context();
    ctx.header['content-type'] = 'text/html; charset=utf-8';
    ctx.header['transfer-encoding'] = 'chunked';

    assert(ctx.is('text/*') === 'text/html');
  });

  describe('when no body is given', function() {
    it('should return null', function() {
      var ctx = context();

      assert(ctx.is() == null);
      assert(ctx.is('image/*') == null);
      assert(ctx.is('image/*', 'text/*') == null);
    });
  });

  describe('when no content type is given', function() {
    it('should return false', function() {
      var ctx = context();
      ctx.header['transfer-encoding'] = 'chunked';

      assert(ctx.is() === false);
      assert(ctx.is('image/*') === false);
      assert(ctx.is('text/*', 'image/*') === false);
    });
  });

  describe('give no types', function() {
    it('should return the mime type', function() {
      var ctx = context();
      ctx.header['content-type'] = 'image/png';
      ctx.header['transfer-encoding'] = 'chunked';

      assert(ctx.is(), 'image/png');
    });
  });

  describe('given one type', function() {
    it('should return the type or false', function() {
      var ctx = context();
      ctx.header['content-type'] = 'image/png';
      ctx.header['transfer-encoding'] = 'chunked';

      assert(ctx.is('png') === 'png');
      assert(ctx.is('.png') === '.png');
      assert(ctx.is('image/png') === 'image/png');
      assert(ctx.is('image/*') === 'image/png');
      assert(ctx.is('*/png') === 'image/png');

      assert(ctx.is('jpeg') === false);
      assert(ctx.is('.jpeg') === false);
      assert(ctx.is('image/jpeg') === false);
      assert(ctx.is('text/*') === false);
      assert(ctx.is('*/jpeg') === false);
    });
  });

  describe('given multiple types', function() {
    it('should return the first match or false', function() {
      var ctx = context();
      ctx.header['content-type'] = 'image/png';
      ctx.header['transfer-encoding'] = 'chunked';

      assert(ctx.is('png') === 'png');
      assert(ctx.is('.png') === '.png');
      assert(ctx.is('text/*', 'image/*') === 'image/png');
      assert(ctx.is('image/*', 'text/*') === 'image/png');
      assert(ctx.is('image/*', 'image/png') === 'image/png');
      assert(ctx.is('image/png', 'image/*') === 'image/png');

      assert(ctx.is(['text/*', 'image/*']) === 'image/png');
      assert(ctx.is(['image/*', 'text/*']) === 'image/png');
      assert(ctx.is(['image/*', 'image/png']) === 'image/png');
      assert(ctx.is(['image/png', 'image/*']) === 'image/png');

      assert(ctx.is('jpeg') === false);
      assert(ctx.is('.jpeg') === false);
      assert(ctx.is('text/*', 'application/*') === false);
      assert(ctx.is('text/html', 'text/plain', 'application/json; charset=utf-8') === false);
    });
  });

  describe('when Content-Type: application/x-www-form-urlencoded', function() {
    it('should match "urlencoded"', function() {
      var ctx = context();
      ctx.header['content-type'] = 'application/x-www-form-urlencoded';
      ctx.header['transfer-encoding'] = 'chunked';

      assert(ctx.is('urlencoded') === 'urlencoded');
      assert(ctx.is('json', 'urlencoded') === 'urlencoded');
      assert(ctx.is('urlencoded', 'json') === 'urlencoded');
    });
  });
});
