import { z } from 'zod'
import { createNoteSchema, noteParamsSchema, updateNoteSchema } from './note.schema'
export const createUserSchema = z.object({
  name: z.string().min(3, 'Name is required').max(255, 'Name too long'),
  username: z.string().min(3, 'Username is required').max(255, 'Username too long'),
  
})

export const updateUserSchema = createUserSchema.partial()

export const userParamsSchema = z.object({
  id: z.uuid('Invalid user   ID format'),
})

export const noteQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
})

export default {
  create: createNoteSchema,
  update: updateNoteSchema,
  params: noteParamsSchema,
  query: noteQuerySchema,
}
