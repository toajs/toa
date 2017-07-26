# Change Log

All notable changes to this project will be documented in this file starting from version **v0.10.0**.
This project adheres to [Semantic Versioning](http://semver.org/).

-----

## [3.0.2] - 2017-07-26

### Changed

- Update dependencies.

-----

## [3.0.1] - 2017-07-08

### Changed

- Add "server" header to response.
- Remove default "x-powered-by" header.

-----

## [3.0.0] - 2017-06-24

### Changed

- Remove lastHandler.
- Remove ctx.onPreEnd.

-----

## [2.6.8] - 2017-06-03

### Changed

- Use normal function to run middlewares instead of generator function.

## [2.6.7] - 2017-06-01

### Changed

- Test in Node.js v8.

## [2.6.6] - 2017-05-15

### Changed

- Change Context's private properties.

## [2.6.5] - 2017-05-05

### Changed

- Update node engines to `>= 4.5.0`.

## [2.6.4] - 2017-04-09

### Changed

- Update dependencies.

## [2.6.3] - 2017-03-30

### Changed

- Update dependencies.

## [2.6.2] - 2017-03-19

### Changed

- Update dependencies.
- Improve response header method.

## [2.6.1] - 2017-02-26

### Changed

- Update dependencies.

## [2.6.0] - 2017-02-16

### Fixed

- Fix malformed content-type header causing exception on charset get.
- Fix tests for new version of http-errors.

### Changed

- Log error for deprecated "mainFn"
- Change default status code to 421
- Update dependencies.

## [2.5.1] - 2017-01-20

### Changed

- Don't unset `Vary` header when error.
- Add `secure` options to cookies.
- Update dependencies.

## [2.5.0] - 2016-12-24

### Changed

- Suppport "toThunk" object as middleware.
- Set header 'x-content-type-options: nosniff' when error.
- Update dependencies.

## [2.4.2] - 2016-12-15

### Changed

- Add test case.
- Update dependencies.

## [2.4.1] - 2016-11-20

### Changed

- Update dependencies.

## [2.4.0] - 2016-10-30

### Changed

- Execute after hooks in LIFO order.
- Update dependencies.

## [2.3.1] - 2016-10-08

### Changed

- Update dependencies.
- Improve tests.

## [2.3.0] - 2016-09-29

### Changed

- Do not recommend `mainFn`. It will be deprecated in next version.
- Improve code.

## [2.2.1] - 2016-09-25

### Changed

- Update dependencies.

## [2.2.0] - 2016-09-20

### Changed

- Add TypeScript typings.

## [2.1.0] - 2016-09-13

### Changed

- Add `context.after(hook)`, instead of `context.onPreEnd` (this will be deprecated). After hooks should be consumed only once.

## [2.0.1] - 2016-09-13

### Changed

- Removed toa's `options.debug`.

## [2.0.0] - 2016-09-11

### Changed

- Rewrited with ES2015, Required Node.js>=v4.
- Add `context.ended`, `context.finished`, `context.closed`.

## [1.8.13] - 2016-09-10

### Fixed

- Subdomains should be [] if the host is an ip.

## [1.8.12] - 2016-09-10

### Changed

- Update dependencies.

## [1.8.11] - 2016-09-01

### Changed

- Add `request.origin`, `context.origin`.

### Fixed

- Fixed documents.

## [1.8.10] - 2016-08-31

### Changed

- Removed unnecessary error processing logic.

### Fixed

- Destroy the previous body stream after response finished.

## [1.8.9] - 2016-08-31

### Changed

- Used lower case header. #4

## [1.8.8] - 2016-08-27

### Changed

- Update dependencies.
- Cleared up code.

## [1.8.7] - 2016-08-20

### Changed

- Update dependencies.
- Cleared up code.

## [1.8.6] - 2016-08-17

### Changed

- Improve Context prototype.

## [1.8.5] - 2016-08-17

### Changed

- Improve code.

## [1.8.4] - 2016-08-16

### Changed

- Improve error message.
- Changed `describe` to `suite` in tests

## [1.8.3] - 2016-08-05

### Changed

- `ctx.throw` used `ctx.createError`.

## [1.8.2] - 2016-08-01

### Changed

- Improve code.
- Fixed ctx.end().

## [1.8.1] - 2016-07-30

### Changed

- Improve code.
- Update readme.

## [1.8.0] - 2016-07-30

### Changed

- Supported more middleware function Style.
- Add `async/await` example.

## [1.7.2] - 2016-07-27

### Changed

- Improve code.

## [1.7.1] - 2016-07-21

### Fixed

- When context emit "end" event, context.headerSent should be true (about stream body).

## [1.7.0] - 2016-07-21

### Changed

- Improve code, classify context, request and response.
- Changed context "finished" event to "finishe" event and "close" event.

## [1.6.5] - 2016-07-21

### Changed

- Improve code.

## [1.6.4] - 2016-07-19

### Fixed

- Fixed respond function and "finished" event.

## [1.6.3] - 2016-07-19

### Fixed

- Fixed stream body.

## [1.6.2] - 2016-07-19

### Fixed

- Fixed error'context.

## [1.6.1] - 2016-07-18

### Fixed

- Fixed error respond.

## [1.6.0] - 2016-07-18

### Changed

- Improve performance, add bench.

## [1.5.2] - 2016-07-16

### Fixed

- Fixed stream body [#3]

## [1.5.1] - 2016-06-15

### Changed

- Update dependencies.

## [1.5.0] - 2016-05-22

### Changed

- Update dependencies.
- Improve error response headers.

## [1.4.3] - 2016-05-15

### Changed

- Update dependencies.

## [1.4.2] - 2016-04-03

### Changed

- Update dependencies, use T-man to test.

## [1.4.1] - 2016-03-13

### Changed

- Update dependencies.

## [1.4.0] - 2016-02-06

### Changed

- Update dependencies, improve code and file structure.

## [1.3.2] - 2016-01-15

### Changed

- Update dependencies, improve code.

## [1.3.1] - 2016-01-02

### Fixed

- Fixed stream body

## [1.3.0] - 2015-12-25

### Changed

- Changed `end` event, it is emited in `respond()` now.
- Add `finished` event, which will be emited after a HTTP request closes, finishes, or errors.
- Removed mainFn's argument `thunk`, it is instead by `ctx.thunk`.

## [1.2.1] - 2015-12-20

### Changed

- Retain CORS headers when throw error
- Update dependencies

## [1.2.0] - 2015-11-28

### Changed

- Do not send a content-type when the type is unknown (koa_#536)
- Improve code

### Fixed

- Fixed stream body response
- Ensure parseurl always working as expected

## [1.1.2] - 2015-11-24

### Fixed

- Fixed stream response.

## [1.1.0] - 2015-11-14

### Changed

- Improve code
- Update dependencies, [thunks](https://github.com/thunks/thunks) update to v4.x with a break changed

## [1.0.1] - 2015-10-11

### Changed

- Improve test
- Update dependencies

## [1.0.0] - 2015-08-23

### Changed

- Removed `context.onerror` method
- Update dependencies
- Update documents

## [0.13.0] - 2015-08-04

### Changed

- `onstop` handler will execute `context.onPreEnd` queue
- Add `context.createError`

## [0.12.3] - 2015-07-16

### Fixed

- Fixed context.toJSON

## [0.12.2] - 2015-06-28

### Changed

- Update dependencies
- Don't unset headers while context throw non-error object.

## [0.12.1] - 2015-06-15

### Fixed

- Fixed `context.end` with `thunks@v3.4.2`

## [0.12.0] - 2015-06-14

### Changed

- Supported `onstop` options for Toa constructor, add `context.end()` to stop request process.
- Add `app.toListener()`
- Toa constructor will not create server by default, server will be created in `app.listen()` if omit in constructor.
- Improve test and documents

## [0.11.1] - 2015-06-01

### Changed

- Coverage test

## [0.11.0] - 2015-06-01

### Changed

- Changed to [JavaScript Standard Style](https://github.com/feross/standard)

## [0.10.0] - 2015-05-24

### Changed

- Mounted `thunk` function to context.
- Removed `app.onmessage`, it become to a module `toa-pm`.
- Update with `koa` v0.21.0.
