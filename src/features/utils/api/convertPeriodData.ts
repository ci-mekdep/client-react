import { PeriodCreateType, PeriodType } from 'src/entities/school/PeriodType'

export const convertPeriodData = (data: PeriodType) => {
  const periodCreate = <PeriodCreateType>{}

  periodCreate.id = data.id
  periodCreate.title = data.title
  periodCreate.school_id = data.school?.id || null

  return periodCreate
}
