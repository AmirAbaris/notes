import type { RequestHandler } from 'express'
import {
  createNote,
  deleteNote as removeNote,
  getNotes,
  updateNote as update,
  getNoteById,
} from '../services/note.service.js'

export const getAllNotes: RequestHandler = async (_, res, next) => {
  try {
    const notes = await getNotes()
    res.status(200).json({ success: true, data: notes })
  } catch (error) {
    next(error)
  }
}

export const getNote: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string
    const notes = await getNoteById(id)
    res.status(200).json({ success: true, data: notes })
  } catch (error) {
    next(error)
  }
}

export const createNewNote: RequestHandler = async (req, res, next) => {
  try {
    const notes = await createNote(req.body)
    res.status(201).json({ success: true, data: notes })
  } catch (error) {
    next(error)
  }
}

export const updateNote: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string
    const notes = await update(id, req.body)
    res.status(200).json({ success: true, data: notes })
  } catch (error) {
    next(error)
  }
}

export const deleteNote: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string
    const deletedNote = await removeNote(id)
    res.status(200).json({ success: true, data: deletedNote })
  } catch (error) {
    next(error)
  }
}
