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

const router = express.Router()

router.get('/', getAllNotes)
router.get('/:id', validateParams(noteSchema.params), getNote)
router.post('/', validateBody(noteSchema.create), createNewNote)
router.patch('/:id', validateParams(noteSchema.params), validateBody(noteSchema.update), updateNote)
router.delete('/:id', validateParams(noteSchema.params), deleteNote)

export default router
