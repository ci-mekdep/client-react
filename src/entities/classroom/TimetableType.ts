import { ClassroomType } from './ClassroomType'
import { SchoolType } from '../school/SchoolType'
import { UserType } from '../school/UserType'
import { ShiftType } from './ShiftType'

export type TimetableType = {
  id: string
  value: string[][]
  shift: ShiftType
  classroom: ClassroomType
  school: SchoolType
  updated_by: UserType
  updated_at: string
}

export type TimetableListType = {
  id: string
  value: string[][]
  shift: ShiftType
  classroom: ClassroomType
  school: SchoolType
  updated_by: UserType | null
  updated_at: string
}

export type TimetableCreateType = {
  id?: string
  value?: string[][]
  shift_id: string | null
  classroom_id: string | null
  school_id: string | null
  updated_at?: string
  this_week?: boolean
}
