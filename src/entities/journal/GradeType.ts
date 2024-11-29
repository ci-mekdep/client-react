export type GradeType = {
  id: string
  value: number
  values: number[]
  reason: string
  lesson_id: string
}

export type GradeCreateType = {
  student_id: string
  student_ids: string[]
  value: number
  values: number[]
  comment: string
}

export type PeriodGradeType = {
  period_id: string
  period_key: number
  student_id: string
  grade_value: string
}
