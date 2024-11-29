import { TimetableCreateType, TimetableType } from 'src/entities/classroom/TimetableType'

export const convertTimetableData = (data: TimetableType) => {
  const timetableCreate = <TimetableCreateType>{}

  timetableCreate.id = data.id
  timetableCreate.shift_id = data.shift?.id
  timetableCreate.school_id = data.school?.id
  timetableCreate.classroom_id = data.classroom?.id
  timetableCreate.value = data.value
  timetableCreate.updated_at = data.updated_at

  return timetableCreate
}
