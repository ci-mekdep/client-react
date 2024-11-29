import { ClassroomCreateType, ClassroomType } from 'src/entities/classroom/ClassroomType'

export const convertClassroomData = (data: ClassroomType) => {
  const classroomCreate = <ClassroomCreateType>{}

  classroomCreate.id = data.id
  classroomCreate.name = data.name
  classroomCreate.level = data.level
  classroomCreate.language = data.language
  classroomCreate.teacher_id = data.teacher?.id
  classroomCreate.school_id = data.school?.id

  return classroomCreate
}
