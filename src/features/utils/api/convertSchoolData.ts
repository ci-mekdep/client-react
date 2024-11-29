import { SchoolCreateType, SchoolType } from 'src/entities/school/SchoolType'

export const convertSchoolData = (data: SchoolType) => {
  const schoolCreate = <SchoolCreateType>{}

  schoolCreate.id = data.id
  schoolCreate.code = data.code
  schoolCreate.name = data.name
  schoolCreate.full_name = data.full_name
  schoolCreate.description = data.description
  schoolCreate.phone = data.phone
  schoolCreate.email = data.email
  schoolCreate.address = data.address
  schoolCreate.level = data.level
  schoolCreate.avatar = data.avatar
  schoolCreate.background = data.background
  schoolCreate.is_secondary_school = data.is_secondary_school
  schoolCreate.is_digitalized = data.is_digitalized

  if (data.admin && data.admin !== null) {
    schoolCreate.admin_id = data.admin.id
  }
  if (data.specialist && data.specialist !== null) {
    schoolCreate.specialist_id = data.specialist.id
  }
  if (data.parent && data.parent !== null) {
    schoolCreate.parent_id = data.parent.id
  }

  return schoolCreate
}
