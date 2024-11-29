import { UserType } from 'src/entities/school/UserType'
import { UserChildrenType } from 'src/entities/school/UserSchoolType'
import { LiteModelType } from 'src/entities/app/GeneralTypes'

export const convertUserChildren = (user: UserType) => {
  const childrenData: UserChildrenType[] = []

  user.children?.map((userChild, index) => {
    let school: LiteModelType | null = null
    if (userChild.school_id && userChild.school_name) {
      school = {
        key: userChild.school_id,
        value: userChild.school_name
      }
    }
    const child = {
      id: userChild.id,
      first_name: userChild.first_name,
      last_name: userChild.last_name,
      middle_name: userChild.middle_name,
      status: userChild.status,
      birthday: userChild.birthday,
      gender: userChild.gender
    }

    let childClassroom: LiteModelType | null = null
    if (userChild.classroom_id && userChild.classroom_name) {
      childClassroom = {
        key: userChild.classroom_id,
        value: userChild.classroom_name
      }
    }

    const childData = {
      index: index,
      child: child,
      selected_child: userChild,
      child_options: [],
      classroom: childClassroom,
      school: school ? school : null
    }

    childrenData.push(childData)
  })

  return childrenData
}
