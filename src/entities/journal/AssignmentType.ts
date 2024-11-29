import { UserListType } from '../school/UserType'

export type AssignmentType = {
  id: string
  title: string | null
  content: string | null
  files: string[] | null
  created_by_user: UserListType | null
  updated_by_user: UserListType | null
}

export type AssignmentCreateType = {
  content: number
  lesson_id: string
  student_ids: string[]
}
