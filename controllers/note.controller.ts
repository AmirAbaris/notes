import { createNote, deleteNode, getNotes, updateNote as update } from '../services/note.service.js'

export const getAllNotes = async (_, res) => {
  try {
    const notes = await getNotes()
    res.status(200).json({ success: true, data: notes })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export const createNewNote = async (req, res) => {
  try {
    const notes = await createNote(req.body)
    res.status(201).json({ success: true, data: notes })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export const updateNote = async (req, res) => {
  try {
    const { id } = req.query
    const notes = await update(id, req.body)
    res.status(200).json({ success: true, data: notes })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.query
    const deletedNote = await deleteNode(id)
    res.status(200).json({ success: true, data: deletedNote })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}
