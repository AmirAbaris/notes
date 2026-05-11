import express from 'express'

import { validateBody, validateParams } from '../middlewares/validate.js'
import {
  createNewUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/user.controller.js'
import userSchema from '../schemas/user.schema.js'

const userRouter = express.Router()

userRouter.get('/', getAllUsers)
userRouter.get('/:id', validateParams(userSchema.params), getUser)
userRouter.post('/', validateBody(userSchema.create), createNewUser)
userRouter.patch(
  '/:id',
  validateParams(userSchema.params),
  validateBody(userSchema.update),
  updateUser
)
userRouter.delete('/:id', validateParams(userSchema.params), deleteUser)

export default userRouter
