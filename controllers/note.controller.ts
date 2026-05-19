import type { RequestHandler } from 'express'
import {
  createNote,
  deleteNote as removeNote,
  getNotes,
  updateNote as update,
  getNoteById,
} from '../services/note.service.js'

export const getAllNotes: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id as string // Adjust according to your auth setup
    if (!userId) {
      throw new Error('User not authenticated')
    }
    const notes = await getNotes(userId)
    res.status(200).json({ success: true, data: notes })
  } catch (error) {
    next(error)
  }
}

export const getNote: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string
    const userId = req.user?.id as string
    if (!userId) {
      throw new Error('User not authenticated')
    }
    const note = await getNoteById(id, userId)
    res.status(200).json({ success: true, data: note })
  } catch (error) {
    next(error)
  }
}

export const createNewNote: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id as string
    if (!userId) {
      throw new Error('User not authenticated')
    }
    const newNote = req.body // should contain title and body only
    const note = await createNote(userId, newNote)
    res.status(201).json({ success: true, data: note })
  } catch (error) {
    next(error)
  }
}

export const updateNote: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string
    const userId = req.user?.id as string
    if (!userId) {
      throw new Error('User not authenticated')
    }
    const updatedData = req.body // can be partial: { title?, body? }
    const updatedNote = await update(id, userId, updatedData)
    res.status(200).json({ success: true, data: updatedNote })
  } catch (error) {
    next(error)
  }
}

export const deleteNote: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string
    const userId = req.user?.id as string
    if (!userId) {
      throw new Error('User not authenticated')
    }
    const deletedNote = await removeNote(id, userId)
    res.status(200).json({ success: true, data: deletedNote })
  } catch (error) {
    next(error)
  }
}
