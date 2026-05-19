import { prisma } from '../lib/prisma'
import { compare, hash } from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'
import { HttpError } from '../middlewares/error-handler'
import { generateAccessToken, generateRefreshToken } from '../lib/auth'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
}

const getRefreshTokenMaxAge = () => 7 * 24 * 60 * 60 * 1000 // 7 days

// Register user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, username, email, password } = req.body

    if (!name || !username || !email || !password) {
      throw new HttpError(400, 'All fields are required')
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      throw new HttpError(400, 'User with this email or username already exists')
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
    })

    const accessToken = await generateAccessToken(user.id)
    const refreshToken = await generateRefreshToken(user.id)

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: getRefreshTokenMaxAge(),
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      success: true,
      user: userWithoutPassword,
      accessToken,
    })
  } catch (error) {
    next(error)
  }
}

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body

    // Validate required fields
    if (!username || !password) {
      throw new HttpError(400, 'Username/email and password are required')
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    })

    if (!user) {
      throw new HttpError(401, 'Invalid credentials')
    }

    // Check password
    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      throw new HttpError(401, 'Invalid credentials')
    }

    // Generate tokens
    const accessToken = await generateAccessToken(user.id)
    const refreshToken = await generateRefreshToken(user.id)

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: getRefreshTokenMaxAge(),
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
      accessToken,
    })
  } catch (error) {
    next(error)
  }
}

// Logout user
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken

    if (refreshToken) {
      // Revoke the refresh token
      await prisma.refreshTokenSession.updateMany({
        where: {
          refreshToken,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      })
    }

    // Clear the cookie
    res.clearCookie('refreshToken', cookieOptions)

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      throw new HttpError(401, 'No refresh token provided')
    }

    // Find the token record
    const tokenRecord = await prisma.refreshTokenSession.findUnique({
      where: { refreshToken },
    })

    // Validate token
    if (!tokenRecord) {
      throw new HttpError(401, 'Invalid refresh token')
    }

    if (tokenRecord.revokedAt) {
      throw new HttpError(401, 'Refresh token has been revoked')
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new HttpError(401, 'Refresh token has expired')
    }

    // Generate new access token
    const newAccessToken = await generateAccessToken(tokenRecord.userId)

    // Optional: Implement token rotation (recommended)
    // Revoke old refresh token and create a new one
    const newRefreshToken = await generateRefreshToken(tokenRecord.userId)

    await prisma.refreshTokenSession.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    })

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: getRefreshTokenMaxAge(),
    })

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    })
  } catch (error) {
    next(error)
  }
}

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        notes: true,
      },
    })

    if (!user) {
      throw new HttpError(404, 'User not found')
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    next(error)
  }
}

// Change password
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Validate input
    if (!currentPassword || !newPassword) {
      throw new HttpError(400, 'Current password and new password are required')
    }

    if (newPassword.length < 6) {
      throw new HttpError(400, 'New password must be at least 6 characters')
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    if (!user) {
      throw new HttpError(404, 'User not found')
    }

    // Verify current password
    const isValidPassword = await compare(currentPassword, user.password)
    if (!isValidPassword) {
      throw new HttpError(401, 'Current password is incorrect')
    }

    // Check if new password is same as old
    const isSamePassword = await compare(newPassword, user.password)
    if (isSamePassword) {
      throw new HttpError(400, 'New password must be different from current password')
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    })

    // Revoke all refresh tokens except current session (force re-login on other devices)
    if (req.cookies?.refreshToken) {
      await prisma.refreshTokenSession.updateMany({
        where: {
          userId: req.user.id,
          refreshToken: { not: req.cookies.refreshToken },
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      })
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again on other devices.',
    })
  } catch (error) {
    next(error)
  }
}
