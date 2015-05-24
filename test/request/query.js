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

describe('ctx.query', function() {
  describe('when missing', function() {
    it('should return an empty object', function() {
      var ctx = context({
        url: '/'
      });
      assert.deepEqual(ctx.query, {});
    });
  });

  it('should return the same object each time it\'s accessed', function(done) {
    var ctx = context({ url: '/' });
    ctx.query.a = '2';
    assert.equal(ctx.query.a, '2');
    done();
  });


  it('should return a parsed query-string', function() {
    var ctx = context({
      url: '/?page=2'
    });
    assert(ctx.query.page, '2');
  });
});

describe('ctx.query=', function() {
  it('should stringify and replace the querystring and search', function() {
    var ctx = context({
      url: '/store/shoes'
    });
    ctx.query = {
      page: 2,
      color: 'blue'
    };
    assert(ctx.url === '/store/shoes?page=2&color=blue');
    assert(ctx.querystring === 'page=2&color=blue');
    assert(ctx.search === '?page=2&color=blue');
  });

  it('should change .url but not .originalUrl', function() {
    var ctx = context({
      url: '/store/shoes'
    });
    ctx.query = {
      page: 2
    };
    assert(ctx.url === '/store/shoes?page=2');
    assert(ctx.originalUrl === '/store/shoes');
    assert(ctx.request.originalUrl === '/store/shoes');
  });
});
