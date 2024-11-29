import { UserChildrenType, UserParentsType, UserRolesType } from 'src/entities/school/UserSchoolType'
import { UserCreateType } from 'src/entities/school/UserType'

export const convertUserReqData = (
  data: UserCreateType,
  userSchools: UserRolesType,
  userChildren: UserChildrenType[],
  userParents: UserParentsType[]
) => {
  const userCreate = <UserCreateType>{}

  userCreate.last_name = data.last_name || null
  userCreate.first_name = data.first_name
  userCreate.middle_name = data.middle_name || null
  userCreate.status = data.status
  userCreate.birthday = data.birthday
  userCreate.phone = data.phone || null
  userCreate.username = data.username
  userCreate.password = data.password || null
  userCreate.gender = data.gender
  userCreate.email = data.email || null
  userCreate.address = data.address || null
  userCreate.district = data.district || null
  userCreate.work_place = data.work_place || null
  userCreate.work_title = data.work_title || null
  userCreate.reference = data.reference || null
  userCreate.education_title = data.education_title || null
  userCreate.education_place = data.education_place || null
  userCreate.education_group = data.education_group || null
  userCreate.classrooms = []
  userCreate.schools = []
  userCreate.documents = []

  if (data.documents) {
    data.documents.forEach(item => {
      userCreate.documents?.push(item)
    })
  }

  Object.entries(userSchools).map(([key, value]) => {
    if (key === 'admin') {
      value.map(item => {
        userCreate.schools?.push({
          role_code: key,
          ...(item.is_delete === true ? { is_delete: true } : null),
          school_id: null
        })
      })
    } else if (key === 'organization' || key === 'operator' || key === 'principal') {
      value.map(item => {
        userCreate.schools?.push({
          role_code: key,
          ...(item.is_delete === true ? { is_delete: true } : null),
          school_id: item.school?.key || null
        })
      })
    } else if (key === 'teacher') {
      value.map(item => {
        userCreate.schools?.push({
          role_code: key,
          ...(item.is_delete === true ? { is_delete: true } : null),
          school_id: item.school?.key || null
        })
        if (item.classroom) {
          userCreate.teacher_classroom_id = item.classroom.key
        }
      })
    } else if (key === 'student') {
      value.map(item => {
        userCreate.schools?.push({
          role_code: key,
          ...(item.is_delete === true ? { is_delete: true } : null),
          school_id: item.school?.key || null
        })
        if (item.classroom) {
          userCreate.classrooms?.push({ classroom_id: item.classroom.key, type: null, type_key: null })
        }
      })

      const parents: UserCreateType[] = []

      userParents.map(userParent => {
        const obj: any = {}
        if (userParent.parent?.id) obj.id = userParent.parent?.id || null
        obj.first_name = userParent.parent?.first_name || null
        obj.last_name = userParent.parent?.last_name || null
        obj.middle_name = userParent.parent?.middle_name || null
        obj.phone = userParent.parent?.phone || null
        obj.birthday = userParent.parent?.birthday || null
        obj.status = 'active'
        obj.schools = [{ role_code: 'parent', school_id: userParent.school?.key || null }]
        parents.push(obj)
      })
      userCreate.parents = parents
    } else if (key === 'parent') {
      const uniqueSchools = [
        ...new Set(userChildren.map(item => item.school?.key).filter(val => val !== null && val !== undefined))
      ]
      uniqueSchools.map(school => {
        userCreate.schools?.push({ role_code: key, school_id: school || null })
      })

      const children: UserCreateType[] = []

      userChildren.map(userChild => {
        const obj: any = {}
        if (userChild.child?.id) obj.id = userChild.child?.id || null
        if (userChild.classroom?.key) {
          obj.classrooms = [
            {
              classroom_id: userChild.classroom?.key,
              type: null,
              type_key: null
            }
          ]
        }
        obj.first_name = userChild.child?.first_name || null
        obj.last_name = userChild.child?.last_name || null
        obj.middle_name = userChild.child?.middle_name || null
        obj.phone = userChild.child?.phone || null
        obj.birthday = userChild.child?.birthday || null
        obj.status = 'active'
        obj.schools = [{ role_code: 'student', school_id: userChild.school?.key || null }]
        children.push(obj)
      })
      userCreate.children = children
    }
  })

  return userCreate
}
