import { NextFunction, Request, Response } from 'express'
import { HttpError } from './error-handler'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET!

export const authMiddleware = async (req: Request, _: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new HttpError(401, `No token provided`)
    }

    jwt.verify(token, JWT_SECRET)

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      throw new HttpError(401, `Invalid or expired session`)
    }

    req.user = session.user
    req.token = token

    next()
  } catch (error) {
    next(error)
  }
}
