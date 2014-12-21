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

describe('ctx.get(name)', function() {
  it('should return the field value', function() {
    var ctx = context();
    ctx.req.headers.host = 'http://google.com';
    ctx.req.headers.referer = 'http://google.com';
    assert(ctx.get('HOST') === 'http://google.com');
    assert(ctx.get('Host') === 'http://google.com');
    assert(ctx.get('host') === 'http://google.com');
    assert(ctx.get('referer') === 'http://google.com');
    assert(ctx.get('referrer') === 'http://google.com');
  });
});
