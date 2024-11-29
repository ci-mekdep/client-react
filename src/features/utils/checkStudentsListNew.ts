import { ClassroomType } from 'src/entities/classroom/ClassroomType'
import { UserListType } from 'src/entities/school/UserType'

export const checkStudentsListNew = (classroomData: ClassroomType | null) => {
  if (classroomData && classroomData.students) {
    const subGroups = classroomData?.sub_groups ? classroomData?.sub_groups : []

    const typeKeyMap: any = {}

    subGroups.forEach(subgroup => {
      const { type, student_ids } = subgroup

      if (typeKeyMap[type]) {
        typeKeyMap[type] = typeKeyMap[type].concat(student_ids)
      } else {
        typeKeyMap[type] = [...(student_ids as string[])]
      }
    })

    const transformedArray = Object.keys(typeKeyMap).map(type => ({
      type: type,
      student_ids: typeKeyMap[type]
    }))

    const students = classroomData?.students.map((student: UserListType) => {
      const studentCopy = { ...student }

      transformedArray.forEach(subgroup => {
        if (!subgroup.student_ids?.includes(studentCopy.id)) {
          Object.assign(studentCopy, { is_new: true })
        }
      })

      return studentCopy
    })

    classroomData.students = students

    return classroomData
  } else {
    return classroomData
  }
}
