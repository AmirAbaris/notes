import type { RequestHandler } from 'express'
import {
  createUser,
  getUserById,
  getUsers,
  updateUser as update,
  deleteUser as remove,
} from '../services/user.service.js'

export const getAllUsers: RequestHandler = async (_, res, next) => {
  try {
    const users = await getUsers()
    res.status(200).json({ success: true, data: users })
  } catch (error) {
    next(error)
  }
}

export const getUser: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string
    const user = await getUserById(id)
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

export const createNewUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await createUser(req.body)
    res.status(201).json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

export const updateUser: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string
    const user = await update(id, req.body)
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string
    const deleteUser = await remove(id)
    res.status(200).json({ success: true, data: deleteUser })
  } catch (error) {
    next(error)
  }
}
