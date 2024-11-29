import { ClassroomType, SubGroupType } from 'src/entities/classroom/ClassroomType'
import { UserListType } from 'src/entities/school/UserType'

export const convertClassroomSubgroupData = (data: ClassroomType) => {
  const students = data.students ? data.students : []
  const subGroups = data.sub_groups ? [...(data.sub_groups as SubGroupType[])] : []

  const transformedData: any = {}

  subGroups.sort((a, b) => {
    if (a.type < b.type) return -1
    if (a.type > b.type) return 1
    if (a.type_key < b.type_key) return -1
    if (a.type_key > b.type_key) return 1

    return 0
  })

  subGroups.forEach(subgroup => {
    const type = subgroup.type
    const typeKey = subgroup.type_key
    const studentIds = subgroup.student_ids
    if (!transformedData[type]) {
      transformedData[type] = {
        type: type,
        first_student_ids: [],
        second_student_ids: []
      }
    }

    if (typeKey === 1) {
      transformedData[type].first_student_ids = transformedData[type].first_student_ids
        .concat(studentIds)
        .map((id: string) => students.find(obj => obj.id === id))
        .filter((student: UserListType) => student !== undefined)
    } else if (typeKey === 2) {
      transformedData[type].second_student_ids = transformedData[type].second_student_ids
        .concat(studentIds)
        .map((id: string) => students.find(obj => obj.id === id))
        .filter((student: UserListType) => student !== undefined)

      transformedData[type].second_student_ids = [
        ...transformedData[type].second_student_ids,
        ...students
          .filter(student => !transformedData[type].first_student_ids?.includes(student))
          .filter(
            student => !transformedData[type].second_student_ids.some((obj: UserListType) => obj.id === student.id)
          )
          .map(obj => ({ ...obj, is_new: true }))
      ]
    }
  })

  const transformedArray = Object.values(transformedData)

  return transformedArray
}
