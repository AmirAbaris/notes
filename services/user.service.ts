import { prisma } from '../lib/prisma'
import { HttpError } from '../middlewares/error-handler.js'
import { CreateUserDto, UpdateUserDto } from '../types/user'

export const getUsers = async () => {
  return await prisma.user.findMany()
}

export const getUserById = async (id: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id } })

  if (!existingUser) {
    throw new HttpError(404, `User with id ${id} not found`)
  }

  return existingUser
}

export const createUser = async (newUser: CreateUserDto) => {
  return await prisma.user.create({
    data: newUser,
  })
}

export const updateUser = async (id: string, newUser: UpdateUserDto) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  })

  if (!existingUser) {
    throw new HttpError(404, `User with id ${id} not found`)
  }

  return await prisma.user.update({
    where: { id },
    data: newUser,
  })
}

export const deleteUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  })

  if (!existingUser) {
    throw new HttpError(404, `User with id ${id} not found`)
  }

  return await prisma.user.delete({
    where: { id },
  })
}
