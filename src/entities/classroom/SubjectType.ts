import { ClassroomListType, ClassroomType } from './ClassroomType'
import { SchoolListType } from '../school/SchoolType'
import { UserListType } from '../school/UserType'
import { ClassroomTypeEnum } from '../app/Enums'
import { PeriodType } from '../school/PeriodType'
import { BaseSubjectListType } from './BaseSubjectType'

export type SubjectExamType = {
  id: string
  name: string | null
  subject: SubjectListType
  classroom: ClassroomListType
  teacher: UserListType
  head_teacher: UserListType
  member_teachers: UserListType[]
  school: SchoolListType
  start_time: string
  time_length_min: number
  room_number: string
  exam_weight_percent: number | null
  is_required: boolean
}

export type SubjectExamCreateType = {
  id?: string
  name?: string | null
  subject_id?: string | null
  teacher_id: string | null
  head_teacher_id?: string | null
  member_teacher_ids?: string[]
  start_time: string | null
  time_length_min: number | null
  room_number: string | null
  is_required: boolean | null
  exam_weight_percent: number | null
}

export type SubjectType = {
  id: string
  name: string
  full_name: string
  week_hours: number
  classroom_type: ClassroomTypeEnum | string | null
  classroom_type_key: number | null
  classroom: ClassroomType
  parent: SubjectType
  parent_id: string
  teacher: UserListType
  second_teacher: UserListType
  school: SchoolListType
  exam: SubjectExamType
  children: SubjectType[]
  exams: SubjectExamType[]
  base_subject: BaseSubjectListType
  period: PeriodType
}

export type SubjectListType = {
  id: string
  name: string
  full_name: string
  week_hours: number
  classroom_type: ClassroomTypeEnum | string | null
  classroom_type_key: number | null
  classroom: ClassroomListType
  parent_id: string
  teacher: UserListType
  child_teacher?: UserListType
  second_teacher: UserListType
  school: SchoolListType
  exam: SubjectExamType
}

export type SubjectCreateType = {
  id?: string
  name: string
  full_name: string
  week_hours: number | null
  classroom_id?: string | null
  classroom_type?: ClassroomTypeEnum | string | null
  classroom_type_key?: number | null
  teacher_id?: string | null
  second_teacher_id?: string | null
  school_id?: string | null
  exam?: SubjectExamCreateType
  exams?: SubjectExamCreateType[]
  base_subject_id?: string | null
  period_id?: string | null
}

export type SubjectImportType = {
  id: string
  classroom_name: string
  name: string
  week_hours: string | number
  teacher_full_name: string
  classroom_type_key: string | number
}

export type SubjectSettingsType = {
  full_name: string
  name: string
  code: string
}
