import { ClassroomCreateType, ClassroomType } from 'src/entities/classroom/ClassroomType'

export const convertGroupData = (data: ClassroomType) => {
  const classroomCreate = <ClassroomCreateType>{}

  const subject = data.subjects[0]
  let newSubject

  classroomCreate.id = data.id
  classroomCreate.name = data.name
  classroomCreate.language = data.language
  classroomCreate.teacher_id = data.teacher?.id
  classroomCreate.school_id = data.school?.id
  classroomCreate.shift_id = data.shift?.id
  classroomCreate.period_id = data.period?.id
  if (subject) {
    newSubject = {
      id: subject.id,
      name: subject.name,
      full_name: subject.full_name,
      week_hours: subject.week_hours,
      teacher_id: subject.teacher?.id,
      base_subject_id: subject.base_subject?.id,
    }

    classroomCreate.subjects = [newSubject]
  }

  return classroomCreate
}
