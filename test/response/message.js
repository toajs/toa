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
var Stream = require('stream');

describe('res.message', function() {
  it('should return the response status message', function() {
    var res = response();
    res.status = 200;
    assert(res.message === 'OK');
  });

  describe('when res.message not present', function() {
    it('should look up in statuses', function() {
      var res = response();
      res.res.statusCode = 200;
      assert(res.message === 'OK');
    });
  });
});

describe('res.message=', function() {
  it('should set response status message', function() {
    var res = response();
    res.status = 200;
    res.message = 'ok';
    assert((res.res.statusMessage || res.res.text) === 'ok');
    assert(res.inspect().message === 'ok');
  });
});
