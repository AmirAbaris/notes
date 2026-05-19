import { NextFunction, Request, Response } from 'express'
import { HttpError } from './error-handler'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET!

type AccessTokenPayload = jwt.JwtPayload & {
  userId: string
}

export const authMiddleware = async (req: Request, _: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new HttpError(401, `No token provided`)
    }

    const payload = jwt.verify(token, JWT_SECRET) as AccessTokenPayload

    if (!payload.userId) {
      throw new HttpError(401, `Invalid access token`)
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      throw new HttpError(401, `Invalid access token`)
    }

    req.user = user
    req.accessToken = token

    next()
  } catch (error) {
    next(error)
  }
}
