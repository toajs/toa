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

describe('req.type', function() {
  it('should return type void of parameters', function() {
    var req = request();
    req.header['content-type'] = 'text/html; charset=utf-8';
    assert(req.type === 'text/html');
  });

  describe('with no host present', function() {
    var req = request();
    assert(req.type == null);
  });
});
