## Response

The same as [Koa's Response](https://github.com/koajs/koa/blob/master/docs/api/response.md)

`Response` object is an abstraction on top of node's vanilla response object, providing additional functionality that is useful for every day HTTP server development.

### API

#### response.header

Response header object.

#### response.headers

Response header object. Alias as `response.header`.

#### response.socket

Request socket.

#### response.status

Get response status. By default, `response.status` is not set unlike node's `res.statusCode` which defaults to `200`.

#### response.status=

Set response status via numeric code:

- 100 "Continue"
- 101 "Switching protocols"
- 102 "Processing"
- 200 "Ok"
- 201 "Created"
- 202 "Accepted"
- 203 "Non-authoritative information"
- 204 "No content"
- 205 "Reset content"
- 206 "Partial content"
- 207 "Multi-status"
- 300 "Multiple choices"
- 301 "Moved permanently"
- 302 "Moved temporarily"
- 303 "See other"
- 304 "Not modified"
- 305 "Use proxy"
- 307 "Temporary redirect"
- 400 "Bad request"
- 401 "Unauthorized"
- 402 "Payment required"
- 403 "Forbidden"
- 404 "Not found"
- 405 "Method not allowed"
- 406 "Not acceptable"
- 407 "Proxy authentication required"
- 408 "Request time-out"
- 409 "Conflict"
- 410 "Gone"
- 411 "Length required"
- 412 "Precondition failed"
- 413 "Request entity too large"
- 414 "Request-uri too large"
- 415 "Unsupported media type"
- 416 "Requested range not satisfiable"
- 417 "Expectation failed"
- 418 "I'm a teapot"
- 422 "Unprocessable entity"
- 423 "Locked"
- 424 "Failed dependency"
- 425 "Unordered collection"
- 426 "Upgrade required"
- 428 "Precondition required"
- 429 "Roo many requests"
- 431 "Request header fields too large"
- 500 "Internal server error"
- 501 "Not implemented"
- 502 "Bad gateway"
- 503 "Service unavailable"
- 504 "Gateway time-out"
- 505 "HTTP version not supported"
- 506 "Variant also negotiates"
- 507 "Insufficient storage"
- 509 "Bandwidth limit exceeded"
- 510 "Not extended"
- 511 "Network authentication required"

__NOTE__: don't worry too much about memorizing these strings,
if you have a typo an error will be thrown, displaying this list
so you can make a correction.

#### response.message

Get response status message. By default, `response.message` is associated with `response.status`.

#### response.message=

Set response status message to the given value.

#### response.length=

Set response Content-Length to the given value.

#### response.length

Return response Content-Length as a number when present, or deduce from `this.body` when possible, or `undefined`.

#### response.body

Get response body.

#### response.body=

Set response body to one of the following:

- `string` written
- `Buffer` written
- `Stream` piped
- `Object` json-stringified
- `null` no content response

If `response.status` has not been set, Toa will automatically set the status to `200` or `204`.

##### String

The Content-Type is defaulted to text/html or text/plain, both with a default charset of utf-8. The Content-Length field is also set.

##### Buffer

The Content-Type is defaulted to application/octet-stream, and Content-Length is also set.

##### Stream

The Content-Type is defaulted to application/octet-stream.

##### Object

The Content-Type is defaulted to application/json.

#### response.get(field)

Get a response header field value with case-insensitive `field`.

```js
let etag = this.response.get('ETag')
```

#### response.set(field, value)

Set response header `field` to `value`:

```js
this.set('Cache-Control', 'no-cache')
```

#### response.append(field, value)

Append additional header `field` with value `val`.

```js
this.append('Link', '<http://127.0.0.1/>')
```

#### response.set(fields)

Set several response header `fields` with an object:

```js
this.set({
  'ETag': '1234',
  'Last-Modified': date
})
```

#### response.remove(field)

Remove header `field`.

#### response.type

Get response `Content-Type` void of parameters such as "charset".

```js
let ct = this.type
// => "image/png"
```

#### response.type=

Set response `Content-Type` via mime string or file extension.

```js
this.type = 'text/plain; charset=utf-8'
this.type = 'image/png'
this.type = '.png'
this.type = 'png'
```

Note: when appropriate a `charset` is selected for you, for example `response.type = 'html'` will default to "utf-8", however when explicitly defined in full as `response.type = 'text/html'` no charset is assigned.

#### response.is(types...)

Very similar to `this.request.is()`. Check whether the response type is one of the supplied types. This is particularly useful for creating middleware that manipulate responses.

#### response.redirect(url, [alt])

Perform a [302] redirect to `url`.

The string "back" is special-cased to provide Referrer support, when Referrer is not present `alt` or "/" is used.

```js
this.redirect('back')
this.redirect('back', '/index.html')
this.redirect('/login')
this.redirect('http://google.com')
```

To alter the default status of `302`, simply assign the status before or after this call. To alter the body, assign it after this call:

```js
this.status = 301
this.redirect('/cart')
this.body = 'Redirecting to shopping cart'
```

#### response.attachment([filename])

Set `Content-Disposition` to "attachment" to signal the client to prompt for download. Optionally specify the `filename` of the download.

#### response.headerSent

Check if a response header has already been sent. Useful for seeing if the client may be notified on error.

#### response.lastModified

Return the `Last-Modified` header as a `Date`, if it exists.

#### response.lastModified=

Set the `Last-Modified` header as an appropriate UTC string. You can either set it as a `Date` or date string.

```js
this.response.lastModified = new Date()
```

#### response.etag=

Set the ETag of a response including the wrapped `"`s. Note that there is no corresponding `response.etag` getter.

```js
this.response.etag = crypto.createHash('md5').update(this.body).digest('hex')
```

#### response.vary(field)

Vary on `field`.
