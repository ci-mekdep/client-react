import format from 'date-fns/format'
import { TeacherExcuseCreateType, TeacherExcuseType } from 'src/entities/school/TeacherExcuseType'

export const convertTeacherExcuseData = (data: TeacherExcuseType) => {
  const teacherExcuseCreate = <TeacherExcuseCreateType>{}

  teacherExcuseCreate.id = data.id
  teacherExcuseCreate.teacher_id = data.teacher ? data.teacher.id : null
  teacherExcuseCreate.start_date = data.start_date ? format(new Date(data.start_date), 'yyyy-MM-dd') : ''
  teacherExcuseCreate.end_date = data.end_date ? format(new Date(data.end_date), 'yyyy-MM-dd') : ''
  teacherExcuseCreate.reason = data.reason
  teacherExcuseCreate.note = data.note
  teacherExcuseCreate.document_files = data.document_files

  return teacherExcuseCreate
}
