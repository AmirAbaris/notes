import {
  createNote,
  deleteNote as removeNote,
  getNotes,
  updateNote as update,
  getNoteById,
} from '../services/note.service.js'

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

export const getNote = async (req, res) => {
  try {
    const { id } = req.params
    const notes = await getNoteById(id)
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
    const { id } = req.params
    console.log('=== UPDATE NOTE DEBUG ===')
    console.log('req.params:', req.params)
    console.log('Extracted id:', id)
    console.log('req.body:', req.body)
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
    const { id } = req.params
    const deletedNote = await removeNote(id)
    res.status(200).json({ success: true, data: deletedNote })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}
