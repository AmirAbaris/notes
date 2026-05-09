import express from 'express'
import {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
} from '../controllers/note.controller.js'

const router = express.Router()

router.get('/', getAllNotes)
router.post('/', createNewNote)
router.post('/update', updateNote)
router.post('/delete', deleteNote)

export default router
