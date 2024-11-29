import { SubjectExamCreateType, SubjectExamType } from 'src/entities/classroom/SubjectType'

export const convertSubjectExamData = (data: SubjectExamType) => {
  const subjectExamCreate = <SubjectExamCreateType>{}

  subjectExamCreate.id = data.id
  subjectExamCreate.name = data.name
  subjectExamCreate.subject_id = data.subject?.id
  subjectExamCreate.teacher_id = data.teacher ? data.teacher.id : null
  subjectExamCreate.head_teacher_id = data.head_teacher ? data.head_teacher.id : null
  subjectExamCreate.member_teacher_ids = data.member_teachers.map(member => member.id)
  subjectExamCreate.start_time = data.start_time
  subjectExamCreate.time_length_min = data.time_length_min
  subjectExamCreate.room_number = data.room_number
  subjectExamCreate.exam_weight_percent = data.exam_weight_percent

  return subjectExamCreate
}
