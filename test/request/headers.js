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

describe('req.headers', function(){
  it('should return the request header object', function(){
    var req = request();
    assert(req.headers === req.req.headers);
  });
});
