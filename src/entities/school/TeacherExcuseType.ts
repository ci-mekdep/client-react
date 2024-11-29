import { SchoolListType } from './SchoolType'
import { UserListType } from './UserType'

export type TeacherExcuseType = {
  id: string
  start_date: string
  end_date: string
  school: SchoolListType | null
  reason: string
  note: string
  document_files: string[]
  teacher: UserListType | null
}

export type TeacherExcuseCreateType = {
  id?: string
  start_date: string | null
  end_date: string | null
  reason: string | null
  note: string | null
  teacher_id: string | null
  document_files?: string[]
}
