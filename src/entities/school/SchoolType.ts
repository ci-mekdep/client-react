import { UserListType } from './UserType'

export type SchoolType = {
  id: string
  code: string
  name: string
  full_name: string
  description: string
  avatar: string
  background: string
  phone: string
  email: string
  address: string
  level: string | null
  classrooms_count: number
  galleries: string[] | null
  latitude: string | null
  longitude: string | null
  admin?: UserListType
  specialist?: UserListType
  parent?: SchoolListType
  is_secondary_school: boolean
  is_digitalized: boolean
  archived_at: string
}

export type SchoolListType = {
  id: string
  code: string
  name: string
  full_name: string
  description: string
  avatar: string
  background: string
  phone: string
  email: string
  address: string
  level: string | null
  classrooms_count: number
  galleries: string[] | null
  latitude: string | null
  longitude: string | null
  admin?: UserListType
  specialist?: UserListType
  parent?: SchoolListType
  is_secondary_school: boolean
  is_digitalized: boolean
  archived_at: string
}

export type SchoolCreateType = {
  id?: string
  code: string
  name: string
  full_name: string
  description?: string
  phone: string
  email: string
  address: string
  level: string | null
  latitude?: string | null
  longitude?: string | null
  avatar?: string
  background?: string
  admin_id?: string | null
  specialist_id?: string | null
  parent_id?: string | null
  is_secondary_school: boolean | null
  is_digitalized: boolean
  galleries?: string[] | null
}
