import { SubjectCreateType, SubjectType } from 'src/entities/classroom/SubjectType'

export const convertSubjectData = (data: SubjectType) => {
  const subjectCreate = <SubjectCreateType>{}

  subjectCreate.id = data.id
  subjectCreate.name = data.name
  subjectCreate.full_name = data.full_name
  subjectCreate.week_hours = data.week_hours
  subjectCreate.classroom_id = data.classroom?.id
  subjectCreate.teacher_id = data.teacher?.id
  subjectCreate.second_teacher_id = data.second_teacher?.id
  subjectCreate.base_subject_id = data.base_subject?.id
  subjectCreate.school_id = data.school?.id
  subjectCreate.classroom_type = data.classroom_type
  subjectCreate.classroom_type_key = data.classroom_type_key

  return subjectCreate
}
