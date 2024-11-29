import { SchoolType } from '../school/SchoolType'
import { UserType } from '../school/UserType'

export interface AdminDashboardStatsType {
  organizations_count: number
  parents_count: number
  principals_count: number
  schools_count: number
  students_count: number
  teachers_count: number
}

export interface PrincipalDashboardStatsType {
  classrooms_count: number
  current_lesson_date: string
  current_lesson_number: number
  current_lesson_subjects: number
  current_lesson_times: string[]
  parents_count: number
  principals_count: number
  students_count: number
  teachers_count: number
}

export interface PrincipalSubjectPercentType {
  absent_percent: number
  absents_count: number
  assignment_title: string | null
  classroom_id: string
  classroom_name: string
  grade_full_percent: number
  grades_count: number
  is_grade_full: boolean
  lesson_date: string
  lesson_title: string | null
  students_count: number
  subject_id: string
  subject_name: string
}

export interface PrincipalDashboardRowType {
  subject_percents: PrincipalSubjectPercentType[]
  teacher: UserType
}

export interface PrincipalDashboardDataType {
  users_birthday: UserType[]
  by_teacher: PrincipalDashboardRowType[]
  current_lesson_date: string
  current_lesson_number: number
  current_lesson_subjects: number
  current_lesson_times: string[]
}

export interface AdminSubjectPercentType {
  absent_percent: number
  absents_count: number
  grade_full_percent: number
  grades_count: number
  is_grade_full: boolean
  lessons_count: number
  school_id: string
  students_count: number
  topics_count: number
}

export interface AdminDashboardRowType {
  subject_percent: AdminSubjectPercentType[]
  school: SchoolType
}

export interface AdminDashboardDataType {
  by_school: AdminDashboardRowType[]
}
