export type StudentNoteType = {
  id: string
  note: string
  student_id: string
  created_at: string
  updated_at: string
}

export type StudentNoteCreateType = {
  student_id: string
  note: string
}
