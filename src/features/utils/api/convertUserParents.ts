import { UserType } from 'src/entities/school/UserType'
import { UserParentsType } from 'src/entities/school/UserSchoolType'
import { LiteModelType } from 'src/entities/app/GeneralTypes'

export const convertUserParents = (user: UserType) => {
  const parentsData: UserParentsType[] = []

  user.parents?.map((userParent, index) => {
    let school: LiteModelType | null = null
    if (userParent.school_id && userParent.school_name) {
      school = {
        key: userParent.school_id,
        value: userParent.school_name
      }
    }
    const parent = {
      id: userParent.id,
      first_name: userParent.first_name,
      last_name: userParent.last_name,
      middle_name: userParent.middle_name,
      status: userParent.status,
      phone: userParent.phone,
      birthday: userParent.birthday,
      gender: userParent.gender
    }

    const parentData = {
      index: index,
      parent: parent,
      selected_parent: userParent,
      parent_options: [],
      school: school ? school : null
    }

    parentsData.push(parentData)
  })

  return parentsData
}
