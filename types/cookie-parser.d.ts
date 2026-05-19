declare module 'cookie-parser' {
  import { RequestHandler } from 'express'

  interface CookieParseOptions {
    decode?: (value: string) => string
  }

  function cookieParser(secret?: string | string[], options?: CookieParseOptions): RequestHandler

  export default cookieParser
}
