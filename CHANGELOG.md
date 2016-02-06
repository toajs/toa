# Change Log

All notable changes to this project will be documented in this file starting from version **v0.10.0**.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.4.0] - 2015-02-06

### change

- Updated dependencies, improve code and file structure.

## [1.3.2] - 2015-01-15

### change

- Updated dependencies, improve code.

## [1.3.1] - 2015-01-02

### fixed

- fixed stream body

## [1.3.0] - 2015-12-25
### change

- Change `end` event, it is emited in `respond()` now.
- Add `finished` event, which will be emited after a HTTP request closes, finishes, or errors.
- Remove mainFn's argument `thunk`, it is instead by `ctx.thunk`.

## [1.2.1] - 2015-12-20
### change

- retain CORS headers when throw error
- update dependencies

## [1.2.0] - 2015-11-28
### change

- do not send a content-type when the type is unknown (koa_#536)
- improve code

### fixed

- fixed stream body response
- ensure parseurl always working as expected

## [1.1.2] - 2015-11-24
### fixed

- fixed stream response.

## [1.1.0] - 2015-11-14
### Changed

- Improve code
- Update dependencies, [thunks](https://github.com/thunks/thunks) updated to v4.x with a break changed

## [1.0.1] - 2015-10-11
### Changed

- Improve test
- Update dependencies

## [1.0.0] - 2015-08-23
### Changed

- Remove `context.onerror` method
- Update dependencies
- Update documents

### Fixed

## [0.13.0] - 2015-08-04
### Changed

- `onstop` handler will execute `context.onPreEnd` queue
- Add `context.createError`

### Fixed

## [0.12.3] - 2015-07-16
### Changed

### Fixed

- Fixed context.toJSON

## [0.12.2] - 2015-06-28
### Changed

- Updated dependencies
- Don't unset headers while context throw non-error object.

### Fixed

## [0.12.1] - 2015-06-15
### Changed

### Fixed

- Fixed `context.end` with `thunks@v3.4.2`

## [0.12.0] - 2015-06-14
### Changed

- Support `onstop` options for Toa constructor, add `context.end()` to stop request process.
- Add `app.toListener()`
- Toa constructor will not create server by default, server will be created in `app.listen()` if omit in constructor.
- Improve test and documents

### Fixed

## [0.11.1] - 2015-06-01
### Changed

- coverage test

### Fixed

---
## [0.11.0] - 2015-06-01
### Changed

- change to [JavaScript Standard Style](https://github.com/feross/standard)

### Fixed

---
## [0.10.0] - 2015-05-24
### Changed

- mount `thunk` function to context.
- remove `app.onmessage`, it become to a module `toa-pm`.
- update with `koa` v0.21.0.

### Fixed
