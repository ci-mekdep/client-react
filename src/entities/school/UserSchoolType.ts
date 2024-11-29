import { Gender, RoleCode } from '../app/Enums'
import { LiteModelType } from '../app/GeneralTypes'
import { ClassroomListType } from '../classroom/ClassroomType'
import { SchoolListType } from './SchoolType'
import { UserListType } from './UserType'

export type UserSchoolType = {
  role_code: RoleCode | string
  school: SchoolListType
}

export type UserSchoolLiteType = {
  role_code: RoleCode | string
  school: LiteModelType
}

export type UserSchoolCreateType = {
  role_code: RoleCode | null | string
  school_id: string | null
}

export type SchoolDataType = {
  role_code?: RoleCode | null | string
  is_old?: boolean
  is_delete?: boolean
  school?: LiteModelType | null
  classroom?: LiteModelType | null
  classroom_options?: LiteModelType[]
  parents?: LiteModelType[] | null
  children?: LiteModelType[] | null
}

export type UserSchoolDataType = {
  index: number
  is_old: boolean
  is_delete?: boolean
  is_active_school: boolean
  school_data: SchoolDataType
}

export type UserSchoolOptionsType = {
  index: number
  schools?: SchoolListType[] | null
  classrooms?: ClassroomListType[] | null
  parents?: LiteModelType[] | null
  children?: LiteModelType[] | null
}

export type UserRolesType = {
  [role: string]: SchoolDataType[]
}

type ChildType = {
  id?: string
  first_name: string
  last_name: string
  middle_name: string
  status: string
  phone?: string
  birthday: string | null
  gender: Gender | null
}

export type UserChildrenType = {
  index: number
  child: ChildType | null
  selected_child: string | UserListType | null
  child_options: UserListType[]
  classroom: LiteModelType | null
  school: LiteModelType | null
}

export type UserParentsType = {
  index: number
  parent: ChildType | null
  selected_parent: string | UserListType | null
  parent_options: UserListType[]
  classroom?: LiteModelType | null
  school: LiteModelType | null
}
