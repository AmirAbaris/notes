import { prisma } from '../lib/prisma'
import { CreateNoteDto } from '../types/note'
import { HttpError } from '../middlewares/error-handler.js'

export const getNotes = async () => {
  return await prisma.note.findMany({
    include: {
      user: true,
    },
  })
}

export const getNoteById = async (id: string) => {
  const existingNote = await prisma.note.findUnique({ where: { id }, include: { user: true } })

  if (!existingNote) {
    throw new HttpError(404, `Note with id ${id} not found`)
  }

  return existingNote
}

export const createNote = async (newNote: CreateNoteDto) => {
  return await prisma.note.create({
    data: newNote,
  })
}

export const updateNote = async (id: string, newNote: CreateNoteDto) => {
  const existingNote = await prisma.note.findUnique({
    where: { id },
  })

  if (!existingNote) {
    throw new HttpError(404, `Note with id ${id} not found`)
  }

  return await prisma.note.update({
    where: { id },
    data: newNote,
  })
}

export const deleteNote = async (id: string) => {
  const existingNote = await prisma.note.findUnique({
    where: { id },
  })

  if (!existingNote) {
    throw new HttpError(404, `Note with id ${id} not found`)
  }

  return await prisma.note.delete({
    where: { id: id },
  })
}
