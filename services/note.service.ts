import { prisma } from '../lib/prisma'
import { CreateNoteDto } from '../types/note'

export const getNotes = async () => {
  return await prisma.note.findMany()
}

export const createNote = async (newNote: CreateNoteDto) => {
  return await prisma.note.create({
    data: newNote,
  })
}

export const updateNote = async (id: string, newNote: CreateNoteDto) => {
  const existingNote = prisma.note.findUnique({
    where: { id },
  })

  if (!existingNote) {
    throw new Error(`Note with id ${id} not found`)
  }

  return await prisma.note.update({
    where: { id },
    data: newNote,
  })
}

export const deleteNote = async (id: string) => {
  const existingNote = prisma.note.findUnique({
    where: { id },
  })

  if (!existingNote) {
    throw new Error(`Note with id ${id} not found`)
  }

  return await prisma.note.delete({
    where: { id: id },
  })
}
