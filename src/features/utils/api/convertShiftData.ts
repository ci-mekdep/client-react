import { ShiftCreateType, ShiftType } from 'src/entities/classroom/ShiftType'

export const convertShiftData = (data: ShiftType) => {
  const shiftCreate = <ShiftCreateType>{}

  shiftCreate.id = data.id
  shiftCreate.name = data.name
  shiftCreate.school_id = data.school?.id

  return shiftCreate
}
