export type NoteDto = {
  id: string
  title: string
  body: string
  userId: string
}

export type CreateNoteDto = {
  title: string
  body: string
}

export type UpdateNoteDto = Partial<CreateNoteDto>
