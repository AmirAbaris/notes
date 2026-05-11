import express from 'express'
import {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
  getNote,
} from '../controllers/note.controller.js'
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.js'
import noteSchema from '../schemas/note.schema.js'

const notesRouter = express.Router()

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
