import { Request, Response, NextFunction } from 'express'
import { ZodError, type ZodType } from 'zod'

type RequestProperty = 'body' | 'query' | 'params'

/**
 *
 * @param schema
 * @param property
 */
export const validate = <T extends ZodType>(schema: T, property: RequestProperty = 'body') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dataToValidate = req[property]
      const validatedData = await schema.parseAsync(dataToValidate)

      req[property] = validatedData
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,

          ...(process.env.NODE_ENV === 'development' && { received: err.input }),
        }))

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: formattedErrors,
          timestamp: new Date().toISOString(),
        })
        return
      }

      next(error)
    }
  }
}

export const validateBody = <T extends ZodType>(schema: T) => validate(schema, 'body')
export const validateQuery = <T extends ZodType>(schema: T) => validate(schema, 'query')
export const validateParams = <T extends ZodType>(schema: T) => validate(schema, 'params')
