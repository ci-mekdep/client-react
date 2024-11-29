import { BookType } from '../app/BooksType'
import { SubjectListType } from '../classroom/SubjectType'
import { SchoolListType } from '../school/SchoolType'
import { AssignmentCreateType, AssignmentType } from './AssignmentType'

export type LessonType = {
  id: string
  title: string
  content: string
  type_title: string
  date: string
  assignment: AssignmentType
  hour_number: number
  period_number: number
  lesson_attrubutes: string[] | null
  lesson_pro: LessonProType | null
  school_id: string
  school: SchoolListType | null
  subject_id: string
  subject: SubjectListType | null
  book: BookType
  book_page: number
}

export type LessonProType = {
  title: string | null
  files: string[] | null
}

export type LessonCreateType = {
  id: string
  title: string
  content: string
  date: string
  hour_number: number
  assignment: AssignmentCreateType
}
