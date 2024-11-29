import { UserType } from 'src/entities/school/UserType'
import { UserRolesType } from 'src/entities/school/UserSchoolType'
import { convertSchoolToLiteModel } from './convertSchoolToLiteModel'

export const convertUserSchools = (user: UserType) => {
  const schoolsData: UserRolesType = {}

  user.schools?.map(userSchool => {
    if (userSchool.role_code === 'admin') {
      schoolsData[userSchool.role_code] = [{ role_code: userSchool.role_code, is_old: true, school: null }]
    } else if (['organization', 'operator', 'principal'].includes(userSchool.role_code)) {
      if (!schoolsData[userSchool.role_code]) {
        schoolsData[userSchool.role_code] = []
      }
      schoolsData[userSchool.role_code].push({
        role_code: userSchool.role_code,
        is_old: true,
        school: convertSchoolToLiteModel(userSchool.school)
      })
    } else if (userSchool.role_code === 'teacher') {
      if (!schoolsData[userSchool.role_code]) {
        schoolsData[userSchool.role_code] = []
      }
      const classroom = user.teacher_classroom || null
      schoolsData[userSchool.role_code].push({
        is_old: true,
        school: convertSchoolToLiteModel(userSchool.school),
        classroom: convertSchoolToLiteModel(classroom)
      })
    } else if (userSchool.role_code === 'student') {
      if (!schoolsData[userSchool.role_code]) {
        schoolsData[userSchool.role_code] = []
      }
      const classroom = user.classrooms?.find(c => c.school_id === userSchool.school?.id) || null
      schoolsData[userSchool.role_code].push({
        is_old: true,
        school: convertSchoolToLiteModel(userSchool.school),
        classroom: convertSchoolToLiteModel(classroom)
      })
    } else if (userSchool.role_code === 'parent') {
      if (!schoolsData[userSchool.role_code]) {
        schoolsData[userSchool.role_code] = []
      }
      const parentSchools = user.schools?.filter(s => s.role_code === 'parent')
      const uniqueSchools = [...new Set(parentSchools.map(p => p.school))]
      schoolsData[userSchool.role_code] = uniqueSchools.map(school => ({
        is_old: true,
        role_code: userSchool.role_code,
        school: convertSchoolToLiteModel(school)
      }))
    }
  })

  return schoolsData
}
