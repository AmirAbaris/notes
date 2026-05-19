import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(255),
  username: z.string().min(3, 'Username must be at least 3 characters').max(42),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(42),
})

export const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(42),
})

export default {
  register: registerSchema,
  login: loginSchema,
  changePassword: changePasswordSchema,
}
