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

describe('res.writable', function() {
  it('should return the request is writable', function() {
    var res = response();
    assert(res.writable);
  });

  describe('when res.socket not present', function() {
    it('should return the request is not writable', function() {
      var res = response();
      res.res.socket = null;
      assert(res.writable === false);
    });
  });
});
