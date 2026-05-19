import express from 'express'
import {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
  refreshAccessToken,
} from '../services/auth.service.js'

import { validateBody } from '../middlewares/validate.js'
import authSchema from '../schemas/auth.schema.js' // optional validation schemas
import { authMiddleware } from '../middlewares/auth.js'

const authRouter = express.Router()

// Public routes
authRouter.post('/register', validateBody(authSchema.register), register)
authRouter.post('/login', validateBody(authSchema.login), login)
authRouter.post('/refresh', refreshAccessToken)

authRouter.use(authMiddleware)
authRouter.post('/logout', logout)
authRouter.get('/me', getCurrentUser)
authRouter.patch('/change-password', validateBody(authSchema.changePassword), changePassword)

export default authRouter
