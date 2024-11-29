import { SubjectSettingsType } from '../classroom/SubjectType'

export type ApiInstanceType = {
  name: string
  url: string
  code: string
}

export type HolidaySettingsType = {
  start_date: string
  end_date: string
  name: string
}

export type MenuAppType = {
  title: NamingType
  link: string
  icon: string
}

export type SettingsPeriodType = {
  current_number: number
  value: string[][]
}

export type NamingType = {
  en: string
  ru: string
  tm: string
}

export type ContactPhoneType = {
  name: string
  value: string
}

export type ContactMessagesType = {
  contact_phones: ContactPhoneType[]
}

export type StudentCommentTypeType = {
  type: string
  comments: NamingType[]
}

export type StudentCommentsType = {
  name: string
  types: StudentCommentTypeType[]
}

export type LessonSettingsType = {
  code: string
  name: NamingType
}

export type GradeReasonType = {
  code: string
  name: NamingType
}

export type AppSettingsGeneralType = {
  api_version: string
  mobile_required_version: string
  api_instances: ApiInstanceType[]
  alert_message: string
  bank_types: string[]
  book_categories: string[]
  holidays: HolidaySettingsType[]
  menu_apps: MenuAppType[]
  contact_messages: ContactMessagesType
  default_period: SettingsPeriodType
  timetable_update_week_available: boolean
  grade_update_minutes: number
  absent_update_minutes: number
  delayed_grade_update_hours: number
  is_archive: boolean
  user_document_keys: string[]
}

export type AppSettingsLessonType = {
  student_comments: StudentCommentsType[]
  lesson_types: LessonSettingsType[]
  grade_reasons: GradeReasonType[]
}

export type AppSettingsSubjectType = {
  base_subjects: string[]
  classroom_group_keys: string[]
  subjects: SubjectSettingsType[]
  topic_tags: string[]
}

export type AppSettingsType = {
  general: AppSettingsGeneralType
  lesson: AppSettingsLessonType
  subject: AppSettingsSubjectType
}

export type AppSettingsUpdateType = {
  alert_message: string
  grade_update_minutes: number
  absent_update_minutes: number
  delayed_grade_update_hours: number
  timetable_update_week_available: boolean
  is_archive: boolean
}
