import { SchoolTransferType, SchoolTransferCreateType } from 'src/entities/app/SchoolTransferType'

export const convertSchoolTransferData = (data: SchoolTransferType) => {
  const schoolTransferCreate = <SchoolTransferCreateType>{}

  schoolTransferCreate.id = data.id
  schoolTransferCreate.student_id = data.student?.id || ''
  schoolTransferCreate.target_school_id = data.target_school?.id || ''
  schoolTransferCreate.target_classroom_id = data.target_classroom?.id || ''
  schoolTransferCreate.source_school_id = data.source_school?.id || ''
  schoolTransferCreate.source_classroom_id = data.source_classroom?.id || ''
  schoolTransferCreate.sent_by = data.sent_by
  schoolTransferCreate.sender_note = data.sender_note
  schoolTransferCreate.sender_files = data.sender_files
  schoolTransferCreate.receiver_note = data.receiver_note
  schoolTransferCreate.received_by = data.received_by
  schoolTransferCreate.status = data.status

  return schoolTransferCreate
}
