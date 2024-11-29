import { BaseSubjectCreateType, BaseSubjectType } from 'src/entities/classroom/BaseSubjectType'

export const convertBaseSubjectData = (data: BaseSubjectType) => {
  const baseSubjectCreate = <BaseSubjectCreateType>{}

  baseSubjectCreate.id = data.id
  baseSubjectCreate.name = data.name
  baseSubjectCreate.category = data.category
  baseSubjectCreate.price = data.price ? Math.floor(data.price / 100) : null
  baseSubjectCreate.exam_min_grade = data.exam_min_grade
  baseSubjectCreate.age_category = data.age_category
  baseSubjectCreate.is_available = data.is_available
  baseSubjectCreate.school_id = data.school ? data.school?.id : null

  return baseSubjectCreate
}
