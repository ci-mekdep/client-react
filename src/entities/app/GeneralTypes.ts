export type DateType = Date | null | undefined

export interface ErrorModelType {
  key?: string
  code?: string
  comment?: string
}

export interface ErrorType {
  error: ErrorModelType
  errors: ErrorModelType[]
}

export interface ErrorKeyType {
  [key: string]: string
}

export interface ShiftGenerateType {
  startTime: Date
  lessonDuration: number
  maxLessonsPerDay: number
  shortBreakDuration: number
  longBreakDuration: number
  bigBreakIndex: number
}

export interface LiteModelType {
  key: string
  value: string
  is_new?: boolean
}

export interface ChangeSchoolParams {
  role_code: string | null
  school_id: string | null
  region_id: string | null
  period_id: string | null
  device_token: string | null
}
