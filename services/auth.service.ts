import { prisma } from '../lib/prisma'
import { compare, hash } from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'
import { HttpError } from '../middlewares/error-handler'
import { generateTokenAndSession } from '../lib/auth'

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, username, email, password } = req.body

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

    const { token } = await generateTokenAndSession(user.id)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    next(error)
  }
}

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body

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

    // Generate token and session
    const { token } = await generateTokenAndSession(user.id)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    next(error)
  }
}

// Logout user
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Delete the session
    if (req.token) {
      await prisma.session.delete({
        where: { token: req.token },
      })
    }

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}

// Get current user profile
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        notes: true,
      },
    })

    res.json(user)
  } catch (error) {
    next(error)
  }
}

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    // Verify current password
    const isValidPassword = await compare(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    })

    // Optional: Delete all other sessions except current
    await prisma.session.deleteMany({
      where: {
        userId: req.user.id,
        token: { not: req.token },
      },
    })

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
