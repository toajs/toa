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

describe('response.is(type)', function() {
  it('should ignore params', function() {
    var res = context().response;
    res.type = 'text/html; charset=utf-8';

    assert(res.is('text/*') === 'text/html');
  });

  describe('when no type is set', function() {
    it('should return false', function() {
      var res = context().response;

      assert(res.is() === false);
      assert(res.is('html') === false);
    });
  });

  describe('when given no types', function() {
    it('should return the type', function() {
      var res = context().response;
      res.type = 'text/html; charset=utf-8';

      assert(res.is() === 'text/html');
    });
  });

  describe('given one type', function() {
    it('should return the type or false', function() {
      var res = context().response;
      res.type = 'image/png';

      assert(res.is('png') === 'png');
      assert(res.is('.png') === '.png');
      assert(res.is('image/png') === 'image/png');
      assert(res.is('image/*') === 'image/png');
      assert(res.is('*/png') === 'image/png');

      assert(res.is('jpeg') === false);
      assert(res.is('.jpeg') === false);
      assert(res.is('image/jpeg') === false);
      assert(res.is('text/*') === false);
      assert(res.is('*/jpeg') === false);
    });
  });

  describe('given multiple types', function() {
    it('should return the first match or false', function() {
      var res = context().response;
      res.type = 'image/png';

      assert(res.is('png') === 'png');
      assert(res.is('.png') === '.png');
      assert(res.is('text/*', 'image/*') === 'image/png');
      assert(res.is('image/*', 'text/*') === 'image/png');
      assert(res.is('image/*', 'image/png') === 'image/png');
      assert(res.is('image/png', 'image/*') === 'image/png');

      assert(res.is(['text/*', 'image/*']) === 'image/png');
      assert(res.is(['image/*', 'text/*']) === 'image/png');
      assert(res.is(['image/*', 'image/png']) === 'image/png');
      assert(res.is(['image/png', 'image/*']) === 'image/png');

      assert(res.is('jpeg') === false);
      assert(res.is('.jpeg') === false);
      assert(res.is('text/*', 'application/*') === false);
      assert(res.is('text/html', 'text/plain', 'application/json; charset=utf-8') === false);
    });
  });

  describe('when Content-Type: application/x-www-form-urlencoded', function() {
    it('should match "urlencoded"', function() {
      var res = context().response;
      res.type = 'application/x-www-form-urlencoded';

      assert(res.is('urlencoded') === 'urlencoded');
      assert(res.is('json', 'urlencoded') === 'urlencoded');
      assert(res.is('urlencoded', 'json') === 'urlencoded');
    });
  });
});
