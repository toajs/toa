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

describe('res.inspect()', function() {
  describe('with no response.res present', function() {
    it('should return null', function() {
      var res = response();
      res.body = 'hello';
      delete res.res;
      assert(res.inspect() == null);
    });
  });

  it('should return a json representation', function() {
    var res = response();
    res.body = 'hello';

    assert.deepEqual(res.inspect(), {
      body: 'hello',
      status: 200,
      message: 'OK',
      header: {
        'content-length': '5',
        'content-type': 'text/plain; charset=utf-8'
      }
    });
  });
});
