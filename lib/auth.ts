import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = '7d' // 7 days

export const generateTokenAndSession = async (userId: string) => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

  // Calculate expiration date
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  // Create session in database
  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return { token, session }
}
