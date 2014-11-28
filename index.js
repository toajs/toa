'use strict';
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT

var util = require('util');
var http = require('http');
var Stream = require('stream');
var assert = require('assert');

var thunks = require('thunks');
var statuses = require('statuses');
var Cookies = require('cookies');
var accepts = require('accepts');
var isJSON = require('koa-is-json');

var Context = require('./lib/context');
var request = require('./lib/request');
var response = require('./lib/response');

module.exports = Toa;

function Toa(server, body) {
  if (!(this instanceof Toa)) return new Toa(server, body);

  this.middleware = [];
  this.request = Object.create(request);
  this.response = Object.create(response);
  this.server = server && isFunction(server.listen) ? server : http.createServer();

  if (this.server !== server) body = server;
  this.body = isFunction(body) ? body : noOp;

  var config = {
    proxy: false,
    env: process.env.NODE_ENV || 'development',
    subdomainOffset: 2,
    poweredBy: 'Toa'
  };

  Object.defineProperty(this, 'config', {
    get: function () {
      return config;
    },
    set: function(obj) {
      assert(obj && obj.constructor === Object, 'require a object');
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) config[key] = obj[key];
      }
    },
    enumerable: true,
    configurable: false
  });
}

/**
* Toa prototype.
*/

var proto = Toa.prototype;

proto.keys = ['toa'];

/**
* Use the given middleware `fn`.
*
* @param {Function} fn
* @return {this}
* @api public
*/

proto.use = function (fn) {
  assert(isFunction(fn), 'require a function');
  this.middleware.push(fn);
  return this;
};

/**
* start server
*
* @param {Mixed} ...
* @return {this}
* @api public
*/

proto.listen = function () {
  var self = this;
  var args = arguments;
  var body = this.body;
  var middleware = this.middleware.slice();

  setImmediate(function () {

    self.server.addListener('request', function (req, res) {
      res.statusCode = 404;

      function onerror(err) {
        try {
          onResError.call(ctx, err);
        } catch (err) {
          self.onerror(err);
        }
      }

      var ctx = createContext(self, req, res);
      var Thunk = thunks(onerror);

      ctx.emit('start');
      ctx.on('error', onerror);

      if (ctx.config.poweredBy) ctx.set('X-Powered-By', ctx.config.poweredBy);

      Thunk.seq.call(ctx, middleware)(function () {
        return body.call(this, Thunk);
      })(respond)(function () {
        this.emit('end');
      });
    });

    self.server.listen.apply(self.server, args);
    console.log(self.config.poweredBy + ' listen: ', args[0].toString());
  });

  return this.server;
};

/**
* Default system error handler.
*
* @param {Error} err
* @api private
*/

proto.onerror = function (err) {
  // ignore null and response error
  if (null == err || err.status < 500) return;
  assert(util.isError(err), 'non-error thrown: ' + err);

  // catch system error
  var msg = err.stack || err.toString();
  console.error(msg.replace(/^/gm, '  '));
};

function noOp() {}

function isFunction(fn) {
  return typeof fn === 'function';
}

/**
* Initialize a new context.
*
* @api private
*/

function createContext(ctx, req, res) {
  var context = new Context(Object.create(ctx.config));
  var request = context.request = Object.create(ctx.request);
  var response = context.response = Object.create(ctx.response);

  context.req = request.req = response.req = req;
  context.res = request.res = response.res = res;
  request.ctx = response.ctx = context;
  request.response = response;
  response.request = request;
  context.originalUrl = request.originalUrl = req.url;
  context.cookies = new Cookies(req, res, ctx.keys);
  context.accept = request.accept = accepts(req);
  context.state = {};
  return context;
}

/**
* Response middleware.
*/

function respond() {
  if (this.respond === false) return;

  var res = this.res;
  if (res.headersSent || !this.writable) return;

  var body = this.body;
  var code = this.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    this.body = null;
    return res.end();
  }

  if (this.method === 'HEAD') {
    if (isJSON(body)) this.length = Buffer.byteLength(JSON.stringify(body));
    return res.end();
  }

  // status body
  if (body == null) {
    this.type = 'text';
    body = this.message || String(code);
    if (body) this.length = Buffer.byteLength(body);
    return res.end(body);
  }

  // responses
  if (typeof body === 'string' || Buffer.isBuffer(body)) return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json
  body = JSON.stringify(body);
  this.length = Buffer.byteLength(body);
  res.end(body);
}

/**
* Default response error handler.
*
* @param {Error} err
* @api private
*/

function onResError(err) {
  if (null == err) return;

  // nothing we can do here other
  // than delegate to the app-level
  // handler and log.
  if (this.headerSent || !this.writable) return;

  // unset all headers
  this.res._headers = {};

  if (!util.isError(err)) {
    this.body = err;
    if (err.status) this.status = err.status;
    return respond.call(this);
  }

  // ENOENT support
  if (err.code === 'ENOENT') err.status = 404;

  // default to 500
  if (typeof err.status !== 'number' || !statuses[err.status]) err.status = 500;

  this.status = err.status;
  this.body = err.toString();
  respond.call(this);
  throw err;
}
