import { prisma } from '../lib/prisma'
import { compare, hash } from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'
import { HttpError } from '../middlewares/error-handler'
import { generateTokenAndSession } from '../lib/auth'

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, username, email, password } = req.body

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })

    if (existingUser) {
      throw new HttpError(400, 'User with this email or username already exists')
    }

    const hashedPassword = await hash(password, 10)
    const user = await prisma.user.create({
      data: { name, username, email, password: hashedPassword },
    })

    const { token } = await generateTokenAndSession(user.id)
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

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body

    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }] },
    })

    if (!user) {
      throw new HttpError(401, 'Invalid credentials')
    }

    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      throw new HttpError(401, 'Invalid credentials')
    }

    const { token } = await generateTokenAndSession(user.id)
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

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.token) {
      await prisma.session.delete({ where: { token: req.token } })
    }
    res.json({ message: 'Logged out successfully' })
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

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })
    if (!user) {
      throw new HttpError(404, 'User not found')
    }

    const isValidPassword = await compare(currentPassword, user.password)
    if (!isValidPassword) {
      throw new HttpError(401, 'Current password is incorrect')
    }

    const hashedPassword = await hash(newPassword, 10)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    })

    // Invalidate all other sessions except the current one
    if (req.token) {
      await prisma.session.deleteMany({
        where: {
          userId: req.user.id,
          token: { not: req.token },
        },
      })
    }

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}
