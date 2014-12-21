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

describe('ctx.idempotent', function(){
  describe('when the request method is idempotent', function (){
    it('should return true', function (){
      ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'].forEach(check);
      function check(method) {
        var req = request();
        req.method = method;
        assert(req.idempotent);
      }
    });
  });

  describe('when the request method is not idempotent', function(){
    it('should return false', function (){
      var req = request();
      req.method = 'POST';
      assert(req.idempotent === false);
    });
  });
});
