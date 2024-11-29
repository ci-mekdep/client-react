import { ClassroomListType } from '../classroom/ClassroomType'
import { SchoolListType } from '../school/SchoolType'
import { UserListType } from '../school/UserType'

export type SchoolTransferType = {
  id: string
  student: UserListType | null
  target_school: SchoolListType | null
  target_classroom: ClassroomListType | null
  source_school: SchoolListType | null
  source_classroom: ClassroomListType | null
  sent_by: UserListType | null
  sender_note: string | null
  sender_files: string[]
  receiver_note: string | null
  received_by: UserListType | null
  status: string | null
  created_at: string
  updated_at: string | null
}

export type SchoolTransferCreateType = {
  id: string
  student_id: string | null
  target_school_id: string | null
  source_classroom_id: string | null
  sender_note: string | null
  sender_files: string[]
  target_classroom_id?: string | null
  receiver_note?: string | null
  received_by?: UserListType | null
  status?: string | null
  source_school_id?: string | null
  sent_by?: UserListType | null
}

export type SchoolTransferUpdateType = {
  id: string
  target_classroom_id?: string | null
  receiver_note: string | null
  status: string | null
}
