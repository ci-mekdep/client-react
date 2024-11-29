import { SubjectType } from './SubjectType'

export type WeekData = {
  shift_times: string[]
  subject: SubjectType
}

export type TeacherTimetableType = {
  week: WeekData[][]
}
