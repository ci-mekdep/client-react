import { SchoolListType } from '../school/SchoolType'

export type BaseSubjectType = {
  id: string
  name: string | null
  category: string | null
  price: number | null
  exam_min_grade: number | null
  age_category: string | null
  is_available: boolean | null
  school: SchoolListType | null
}

export type BaseSubjectListType = {
  id: string
  name: string | null
  category: string | null
  price: number | null
  exam_min_grade: number | null
  age_category: string | null
  is_available: boolean | null
  school: SchoolListType | null
}

export type BaseSubjectCreateType = {
  id?: string
  name: string | null
  category: string | null
  age_category: string | null
  is_available: boolean | null
  exam_min_grade: string | number | null
  price: string | number | null
  school_id: string | null
}
