import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'

const isDevelopment = process.env.NODE_ENV === 'development'
const DEFAULT_ERROR_MESSAGE = 'Internal server error'

type ErrorWithStatus = Error & {
  status?: number
  statusCode?: number
  expose?: boolean
}

export class HttpError extends Error {
  statusCode: number
  expose: boolean

  constructor(statusCode: number, message: string, expose = statusCode < 500) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.expose = expose
  }
}

const getStatusCode = (err: ErrorWithStatus, res: Response) => {
  const statusCode = err.statusCode ?? err.status ?? res.statusCode

  if (statusCode >= 400 && statusCode < 600) {
    return statusCode
  }

  return 500
}

const getClientMessage = (err: ErrorWithStatus, statusCode: number) => {
  if (isDevelopment || err.expose || statusCode < 500) {
    return err.message || DEFAULT_ERROR_MESSAGE
  }

  return DEFAULT_ERROR_MESSAGE
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new HttpError(404, `Route not found: ${req.originalUrl}`))
}

export const errorHandler: ErrorRequestHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    next(err)
    return
  }

  const statusCode = getStatusCode(err, res)
  const message = getClientMessage(err, statusCode)

  if (statusCode >= 500) {
    console.error(err)
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      method: req.method,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      ...(isDevelopment && { stack: err.stack }),
    },
  })
}
