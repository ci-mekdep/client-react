import { SchoolListType } from './SchoolType'

export type PeriodDataCountsType = {
  absents_count: number | null
  classrooms_count: number | null
  grades_count: number | null
  students_count: number | null
  subject_hours: number | null
  teachers_count: number | null
  timetables_count: number | null
}

export type PeriodType = {
  id: string
  title: string
  value: string[][]
  is_enabled: boolean
  archive_link: string | null
  is_archived: boolean | null
  data_counts: PeriodDataCountsType | null
  school: SchoolListType | null
}

export type PeriodCreateType = {
  id?: string
  title: string
  value: string[][]
  is_enabled?: boolean
  school_id: string | null
}
