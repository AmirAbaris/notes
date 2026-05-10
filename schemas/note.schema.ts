import { z } from 'zod'
export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),

  body: z
    .string()
    .min(1, 'Body content is required')
    .min(10, 'Body should be at least 10 characters')
    .max(10000, 'Body too long'),
})

export const updateNoteSchema = createNoteSchema.partial()

export const noteParamsSchema = z.object({
  id: z.uuid('Invalid note ID format'),
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
