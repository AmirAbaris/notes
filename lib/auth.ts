import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET!
const ACCESS_EXPIRES_IN = '15m'
const REFRESH_DAYS = 7

export const generateAccessToken = async (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN })
}

export const generateRefreshToken = async (userId: string) => {
  const token = crypto.randomBytes(64).toString('hex')

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS)

  await prisma.refreshTokenSession.create({
    data: {
      userId,
      refreshToken: token,
      expiresAt,
    },
  })

  return token
}
