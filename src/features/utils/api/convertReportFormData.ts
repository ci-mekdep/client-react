import { ReportFormCreateType, ReportFormType } from 'src/entities/app/ReportFormType'

export const convertReportFormData = (data: ReportFormType) => {
  const reportFormCreate = <ReportFormCreateType>{}

  reportFormCreate.id = data.id
  reportFormCreate.title = data.title
  reportFormCreate.description = data.description
  reportFormCreate.value_types = data.value_types
  reportFormCreate.school_ids = data.school_ids
  reportFormCreate.is_pinned = data.is_pinned
  reportFormCreate.is_center_rating = data.is_center_rating
  reportFormCreate.is_classrooms_included = data.is_classrooms_included

  return reportFormCreate
}
