import { SchoolListType } from '../school/SchoolType'
import { ClassroomListType } from '../classroom/ClassroomType'
import { UserListType } from '../school/UserType'

export type ReportFormItemType = {
  id: string
  school: SchoolListType
  classroom: ClassroomListType
  is_edited_manually: boolean
  values: string[] | null
  updated_at: string
  updated_by_user: UserListType | null
}

export type ReportFormRowType = {
  key: string
  header: string
  type: string
  type_options: string[] | null
  group: string | null
}

export type ReportFormType = {
  id: string
  title: string
  description: string
  school_ids: string[]
  is_pinned: boolean
  is_center_rating: boolean
  is_classrooms_included: boolean
  items_count: number
  items_filled_count: number
  report_item: ReportFormItemType
  report_items: ReportFormItemType[]
  value_types: ReportFormRowType[]
}

export type ReportFormCreateType = {
  id?: string
  title: string
  description: string
  value_types: ReportFormRowType[]
  school_ids: string[]
  is_pinned: boolean
  is_center_rating: boolean
  is_classrooms_included: boolean
}

export type ReportFormRatingRowType = {
  report_item: ReportFormItemType
  value: number
  index: number
}

export type ReportFormRatingType = {
  report: ReportFormType
  rating: ReportFormRatingRowType[]
}

export type ReportFormSubmitType = {
  school_id: string | null
  values: string[] | null
}

export type SettingsReportFormKeyType = {
  group: string
  header: string
  key: string
  type: string
  value: string
}
