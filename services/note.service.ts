import { prisma } from '../lib/prisma'
import { HttpError } from '../middlewares/error-handler.js'
import { CreateNoteDto, UpdateNoteDto } from '../types/note'

export const getNotes = async (userId: string) => {
  return await prisma.note.findMany({
    where: { userId }, // Fixed: filter by userId, not id
    include: {
      user: true,
    },
  })
}

export const getNoteById = async (id: string, userId: string) => {
  const existingNote = await prisma.note.findFirst({
    where: { id, userId }, // Use findFirst to check ownership without composite unique
    include: { user: true },
  })

  if (!existingNote) {
    throw new HttpError(404, `Note with id ${id} not found`)
  }

  return existingNote
}

export const createNote = async (userId: string, newNote: CreateNoteDto) => {
  return await prisma.note.create({
    data: {
      title: newNote.title,
      body: newNote.body,
      userId, // Use the userId parameter, not from DTO
    },
  })
}

export const updateNote = async (id: string, userId: string, updatedData: UpdateNoteDto) => {
  // First check if the note exists and belongs to the user
  const existingNote = await prisma.note.findFirst({
    where: { id, userId },
  })

  if (!existingNote) {
    throw new HttpError(404, `Note with id ${id} not found or access denied`)
  }

  return await prisma.note.update({
    where: { id },
    data: updatedData,
  })
}

export const deleteNote = async (id: string, userId: string) => {
  const existingNote = await prisma.note.findFirst({
    where: { id, userId },
  })

  if (!existingNote) {
    throw new HttpError(404, `Note with id ${id} not found or access denied`)
  }

  return await prisma.note.delete({
    where: { id },
  })
}
