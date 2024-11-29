import { SchoolListType } from '../school/SchoolType'
import { UserListType } from '../school/UserType'

export type ContactItemType = {
  id: string
  user_id: string | null
  related_id: string[]
  school_id: string | null
  message: string
  type: string
  status: string
  birth_cert_number: string
  classroom_name: string
  parent_phone: string
  related_children: ContactItemType[]
  related_children_count: number
  note: string
  related: ContactItemType | null
  files: string[]
  user: UserListType
  school: SchoolListType
  created_at: string
  updated_by: UserListType | null
}

export type ContactItemCreateType = {
  id: string
  user_id: string | null
  related_id: string | null
  school_id: string | null
  message: string
  type: string
  status: string
  birth_cert_number: string
  classroom_name: string
  parent_phone: string
  note?: string
  files: string[]
}
