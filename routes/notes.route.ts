import express from 'express'
import {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
  getNote,
} from '../controllers/note.controller.js'
import { validateBody, validateParams } from '../middlewares/validate.js'
import noteSchema from '../schemas/note.schema.js'
import { authMiddleware } from '../middlewares/auth.js'

const notesRouter = express.Router()

notesRouter.use(authMiddleware)
notesRouter.get('/', getAllNotes)
notesRouter.get('/:id', validateParams(noteSchema.params), getNote)
notesRouter.post('/', validateBody(noteSchema.create), createNewNote)
notesRouter.patch(
  '/:id',
  validateParams(noteSchema.params),
  validateBody(noteSchema.update),
  updateNote
)
notesRouter.delete('/:id', validateParams(noteSchema.params), deleteNote)

export default notesRouter
