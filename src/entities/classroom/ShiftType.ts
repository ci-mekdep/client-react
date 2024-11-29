import { SchoolType } from '../school/SchoolType'
import { UserListType } from '../school/UserType'

export type ShiftType = {
  id: string
  name: string
  value: (string[] | null)[][]
  classrooms_count: number
  timetables_count: number
  school: SchoolType
  updated_by: UserListType
}

export type ShiftListType = {
  id: string
  name: string
  value: (string[] | null)[][]
  classrooms_count: number
  timetables_count: number
}

export type ShiftCreateType = {
  id?: string
  school_id: string | null
  name: string
  value: (string[] | null)[][]
}
