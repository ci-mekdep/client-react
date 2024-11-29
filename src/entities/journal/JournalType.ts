import { AbsentCreateType, AbsentType } from './AbsentType'
import { GradeCreateType, GradeType, PeriodGradeType } from './GradeType'
import { LessonCreateType, LessonType } from './LessonType'
import { UserListType } from '../school/UserType'
import { StudentNoteType } from './StudentNoteType'

export type JournalLessonsType = {
  lesson: LessonType
  grades: GradeType[]
  absents: AbsentType[]
}

export type JournalType = {
  students: UserListType[]
  period_grades: PeriodGradeType[]
  student_notes: StudentNoteType[]
  lessons: JournalLessonsType[]
}

export type JournalCreateType = {
  lesson: LessonCreateType
  grade: GradeCreateType
  absent: AbsentCreateType
}
