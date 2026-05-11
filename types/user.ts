import { NoteDto } from './note'

export type UserDto = {
  id: string
  name: string
  username: string
  notes: NoteDto[]
}

export type CreateUserDto = {
  name: string
  username: string
}

export type UpdateUserDto = Partial<CreateUserDto>
