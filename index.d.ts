// Type definitions for toa
// Project: https://github.com/toajs/toa
// Definitions by: zensh <https://github.com/zensh>

// Import: `import * as Toa from 'toa'`
// Import: `import { Toa } from 'toa'`

import { Socket } from 'net'
import { Stream } from 'stream'
import { EventEmitter } from 'events'
import { IncomingMessage, ServerResponse, Server } from 'http'

interface Callback {
  (err?: Error): void;
}

interface ThunkLikeFunction {
  (fn: Callback): void;
}

interface ThunkFunction {
  (fn?: Callback): ThunkFunction;
}

interface GeneratorFunction extends Function {
  (): Generator;
}

interface GeneratorFunctionConstructor {
  new (...args: string[]): GeneratorFunction;
  (...args: string[]): GeneratorFunction;
  prototype: GeneratorFunction;
}

interface IteratorResult {
  done: boolean;
  value: any;
}

interface Generator {
  constructor: GeneratorFunctionConstructor;
  next(value?: any): IteratorResult;
  throw(err?: Error): IteratorResult;
  return(value?: any): IteratorResult;
}

interface AsyncFunction extends Function {
  (): PromiseLike;
}

interface AsyncFunctionConstructor {
  new (...args: string[]): AsyncFunction;
  (...args: string[]): AsyncFunction;
  prototype: AsyncFunction;
}

interface PromiseLike {
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: Error) => any): PromiseLike;
}

interface ToThunk {
  toThunk(): ThunkLikeFunction;
}

interface ToPromise {
  toPromise(): PromiseLike;
}

interface OtherMiddlewareFn {
  (): ThunkLikeFunction | PromiseLike | GeneratorFunction | AsyncFunction | Generator | ToThunk | ToPromise | void;
}

type MiddlewareFn = ThunkLikeFunction | GeneratorFunction | AsyncFunction | OtherMiddlewareFn;

interface Accept {
  charset(charsets: Array<string>): string | boolean;
  charsets(): Array<string>;
  encoding(encodings: Array<string>): string | boolean;
  encodings(): Array<string>;
  language(languages: Array<string>): string | boolean;
  languages(): Array<string>;
  type(types: Array<string>): string | boolean;
  types(): Array<string>;
}

interface Cookies {
  get(name: string, options: Object): string | void;
  set(name: string, value?: string, options?: Object): Cookies;
}

interface HttpError {
  name: string;
  message: string;
  stack: string;
  status: number;
  statusCode: number;
  expose: boolean;
}

interface RequestProto {
  readonly response: Response;
  readonly header: Object;
  readonly headers: Object;
  url: string;
  readonly origin: string;
  readonly href: string;
  method: string;
  path: string;
  query: Object;
  querystring: string;
  search: string;
  readonly host: string;
  readonly hostname: string;
  readonly fresh: boolean;
  readonly stale: boolean;
  readonly idempotent: boolean;
  readonly socket: Socket;
  readonly charset: string;
  readonly length: number;
  readonly protocol: 'http' | 'https';
  readonly secure: boolean;
  readonly ip: string;
  readonly ips: Array<string>;
  readonly subdomains: Array<string>;
  accepts(...args: Array<string>): Array<string> | string | boolean;
  acceptsEncodings(...args: Array<string>): Array<string> | string;
  acceptsCharsets(...args: Array<string>): Array<string> | string;
  acceptsLanguages(...args: Array<string>): Array<string> | string;
  is(...args: Array<string>): string | boolean | void;
  readonly type: string;
  get(field: string): string;
  inspect(): Object;
  toJSON(): Object;
}

interface Request extends RequestProto {
  ctx: Context;
  req: IncomingMessage;
  res: ServerResponse;
  accept: Accept;
  readonly originalUrl: string;
}

interface ResponseProto {
  readonly request: Request;
  readonly socket: Socket;
  readonly header: Object;
  readonly headers: Object;
  status: number;
  message: string;
  body: any;
  length: number;
  readonly headerSent: boolean;
  vary(string): void;
  redirect(url: string, alt?: string): void;
  attachment(filename: string): void;
  type: string;
  lastModified: string | Date;
  etag: string;
  is(...args: Array<string>): string | boolean;
  get(field: string): string;
  set(field: string, val: any): void;
  set(obj: Object): void;
  append(field: string, val: string | Array<string>): void;
  remove(field: string): void;
  inspect(): Object;
  toJSON(): Object;
}

interface Response extends ResponseProto {
  ctx: Context;
  req: IncomingMessage;
  res: ServerResponse;
}

interface ContextProto extends EventEmitter {
  createError(status: number, message?: string, properties?: Object): HttpError;
  createError(message: string, properties?: Object): HttpError;
  createError(error: Error): HttpError;
  assert(...args: Array<any>): boolean;
  throw(status: number, message?: string, properties?: Object): void;
  throw(message: string, properties?: Object): void;
  throw(error: Error): void;
  end(message?: string): void;
  catchStream(stream: Stream): Stream;
  inspect(): Object;
  toJSON(): Object;

  // Response delegation.
  status: number;
  message: string;
  body: any;
  length: number;
  readonly headerSent: boolean;
  vary(string): void;
  redirect(url: string, alt?: string): void;
  attachment(filename: string): void;
  type: string;
  lastModified: string | Date;
  etag: string;
  set(field: string, val: any): void;
  set(obj: Object): void;
  append(field: string, val: string | Array<string>): void;
  remove(field: string): void;

  // Request delegation.
  readonly header: Object;
  readonly headers: Object;
  url: string;
  readonly origin: string;
  readonly href: string;
  method: string;
  path: string;
  query: Object;
  querystring: string;
  search: string;
  readonly host: string;
  readonly hostname: string;
  readonly fresh: boolean;
  readonly stale: boolean;
  readonly idempotent: boolean;
  readonly socket: Socket;
  readonly protocol: 'http' | 'https';
  readonly secure: boolean;
  readonly ip: string;
  readonly ips: Array<string>;
  readonly subdomains: Array<string>;
  accepts(...args: Array<string>): Array<string> | string | boolean;
  acceptsEncodings(...args: Array<string>): Array<string> | string;
  acceptsCharsets(...args: Array<string>): Array<string> | string;
  acceptsLanguages(...args: Array<string>): Array<string> | string;
  is(...args: Array<string>): string | boolean | void;
  get(field: string): string;
}

interface Context extends ContextProto {
  req: IncomingMessage;
  res: ServerResponse;
  readonly request: Request;
  readonly response: Response;
  state: Object;
  accept: Accept;
  cookies: Cookies;
  respond: boolean;
  readonly config: Object;
  readonly ended: boolean;
  readonly closed: boolean;
  readonly finished: boolean;
  readonly originalUrl: string;
  after(hook: MiddlewareFn): number;
}

interface Onerror {
  (err: Error): any;
}

interface ToaOptions {
  onerror: Onerror;
}

declare class Toa {
  config: Object;
  server?: Server;
  Context: Context;
  context: ContextProto;
  request: RequestProto;
  response: ResponseProto;
  keys?: Array<any> | string;
  middleware: Array<MiddlewareFn>;
  use(fn: MiddlewareFn): Toa;
  onerror(error: Error): void;
  listen(...args: Array<any>): Server;
  toListener(): (req: IncomingMessage, res: ServerResponse) => void;
  constructor(server?: Server, mainHandle?: MiddlewareFn, options?: ToaOptions | Onerror);
  constructor(mainHandle?: MiddlewareFn, options?: ToaOptions | Onerror);
  constructor(options?: ToaOptions);
}

declare namespace Toa {
  export const NAME: string;
  export const VERSION: string;
  export const AUTHORS: Array<string>;
  export class Toa {
    config: Object;
    server?: Server;
    Context: Context;
    context: ContextProto;
    request: RequestProto;
    response: ResponseProto;
    keys?: Array<any> | string;
    middleware: Array<MiddlewareFn>;
    use(fn: MiddlewareFn): Toa;
    onerror(error: Error): void;
    listen(...args: Array<any>): Server;
    toListener(): (req: IncomingMessage, res: ServerResponse) => void;
    constructor(server?: Server, mainHandle?: MiddlewareFn, options?: ToaOptions | Onerror);
    constructor(mainHandle?: MiddlewareFn, options?: ToaOptions | Onerror);
    constructor(options?: ToaOptions);
  }
}

export = Toa;
