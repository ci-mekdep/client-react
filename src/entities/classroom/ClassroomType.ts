import { UserListType } from '../school/UserType'
import { SchoolListType } from '../school/SchoolType'
import { SubjectCreateType, SubjectExamType, SubjectType } from './SubjectType'
import { ClassroomTypeEnum } from '../app/Enums'
import { ShiftListType } from './ShiftType'
import { PeriodType } from '../school/PeriodType'

export type SubGroupType = {
  id?: string | null
  type: ClassroomTypeEnum | string
  type_key: number
  student_ids?: string[] | null
}

export type SubGroupModelType = {
  type: ClassroomTypeEnum | string
  first_student_ids: UserListType[] | null
  second_student_ids: UserListType[] | null
}

export type ClassroomType = {
  id: string
  name: string
  students_count: number
  students: UserListType[]
  subjects: SubjectType[]
  teacher: UserListType
  student: UserListType
  school: SchoolListType
  shift: ShiftListType
  period: PeriodType
  exams: SubjectExamType[]
  level: string | null
  language: string | null
  sub_groups: SubGroupType[] | null
  school_id: string | null
}

export type ClassroomListType = {
  id: string
  name: string
  students_count: number
  students: UserListType[]
  subjects: SubjectType[]
  teacher: UserListType
  student: UserListType
  school: SchoolListType
  shift: ShiftListType
  period: PeriodType
  exams: SubjectExamType[]
  level: string | null
  language: string | null
  sub_groups: SubGroupType[] | null
  school_id: string | null
}

export type ClassroomCreateType = {
  id?: string
  name?: string
  level?: string | null
  language?: string | null
  subjects?: SubjectCreateType[]
  student_ids?: string[]
  subject_ids?: string[]
  teacher_id?: string | null
  student_id?: string | null
  period_id?: string | null
  school_id?: string | null
  shift_id?: string | null
  sub_groups?: SubGroupType[]
}
