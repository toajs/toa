'use strict'

const Vinyl = require('vinyl')
const vfs = require('vinyl-fs')
const through = require('through2')

var guide = ''
vfs.src([
  'doc/api/application.md',
  'doc/api/context.md',
  'doc/api/request.md',
  'doc/api/response.md'
])
  .pipe(through.obj(function (file, code, next) {
    guide += file.contents.toString() + '\n\n------\n\n'
    next()
  }, function (done) {
    this.push(new Vinyl({path: __dirname, contents: Buffer.from(guide)}))
    console.log(guide)
    done()
  }))
  .pipe(vfs.dest('doc/guide.md'))
  .on('finish', () => console.log('Finished!'))
