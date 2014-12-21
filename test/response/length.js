'use strict';
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it, before, after, beforeEach, afterEach*/

/*jshint -W124 */

var assert = require('assert');
var response = require('../context').response;
var fs = require('fs');

describe('res.length', function() {
  describe('when Content-Length is defined', function() {
    it('should return a number', function() {
      var res = response();
      res.header['content-length'] = '120';
      assert(res.length === 120);
    });
  });
});

describe('res.length', function() {
  describe('when Content-Length is defined', function() {
    it('should return a number', function() {
      var res = response();
      res.set('Content-Length', '1024');
      assert(res.length === 1024);
    });
  });

  describe('when Content-Length is not defined', function() {
    describe('and a .body is set', function() {
      it('should return a number', function() {
        var res = response();

        res.body = 'foo';
        res.remove('Content-Length');
        assert(res.length === 3);

        res.body = 'foo';
        assert(res.length === 3);

        res.body = new Buffer('foo bar');
        res.remove('Content-Length');
        assert(res.length === 7);

        res.body = new Buffer('foo bar');
        assert(res.length === 7);

        res.body = {
          hello: 'world'
        };
        res.remove('Content-Length');
        assert(res.length === 17);

        res.body = {
          hello: 'world'
        };
        assert(res.length === 17);

        res.body = fs.createReadStream('package.json');
        assert(res.length == null);

        res.body = null;
        assert(res.length == null);
      });
    });

    describe('and .body is not', function() {
      it('should return undefined', function() {
        var res = response();
        assert(res.length == null);
      });
    });
  });
});
