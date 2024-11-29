import { Gender, Status } from '../app/Enums'
import { ClassroomListType, ClassroomType } from '../classroom/ClassroomType'
import { UserClassroomCreateType } from '../classroom/UserClassroomType'
import { SchoolListType } from './SchoolType'
import { UserSchoolCreateType, UserSchoolType } from './UserSchoolType'

export type UserType = {
  id: string
  first_name: string
  last_name: string
  middle_name: string
  username: string
  password: string
  status: Status
  phone: string
  phone_verified_at: string
  email: string
  email_verified_at: string
  is_active: boolean
  last_online_at: string | null
  birthday: string | null
  gender: Gender | null
  address: string
  avatar: string
  role: string | null
  school_name: string | null
  school_parent: string | null
  school_id: string | null
  classroom_name: string | null
  classroom_id: string | null
  tariff_end_at: string | null
  tariff_type: string | null
  week_hours: number | null
  parents: UserListType[]
  children: UserListType[]
  schools: UserSchoolType[]
  classrooms: ClassroomType[]
  teacher_classroom: ClassroomListType | null
  documents: DocumentType[]
  document_files: string[] | null
  work_title: string | null
  work_place: string | null
  district: string | null
  reference: string | null
  nickname: string | null
  education_title: string | null
  education_place: string | null
  education_group: string | null
  permissions?: string[]
  permissions_write?: string[]
  created_at: string
}

export type UserListType = {
  id: string
  first_name: string
  last_name: string
  middle_name: string
  username: string
  password: string
  status: Status
  phone: string
  phone_verified_at: string
  email: string
  email_verified_at: string
  birthday: string
  gender: Gender | null
  address: string
  avatar: string
  role: string | null
  week_hours: number | null
  teacher_classroom: ClassroomListType | null
  documents: DocumentType[] | null
  document_files: string[] | null
  work_title: string | null
  work_place: string | null
  district: string | null
  reference: string | null
  nickname: string | null
  education_title: string | null
  education_place: string | null
  education_group: string | null
  school_name: string | null
  school_parent: string | null
  school_id: string | null
  classroom_name: string | null
  classroom_id: string | null
  is_new?: boolean
  created_at: string
}

export type UserEditType = {
  first_name: string
  middle_name: string
  last_name: string
  birthday: string
  gender: Gender
  address: string
  avatar: string
}

export type UserCreateType = {
  id?: string
  first_name: string | null
  last_name?: string | null
  middle_name?: string | null
  status: Status
  username: string | null
  birthday: string | null
  gender: number | null
  phone?: string | null
  email?: string | null
  password?: string | null
  address?: string | null
  avatar?: File | string
  teacher_classroom_id?: string
  schools?: UserSchoolCreateType[]
  classrooms?: UserClassroomCreateType[]
  parent_ids?: string[]
  children_ids?: string[]
  parents?: UserCreateType[]
  children?: UserCreateType[]
  documents?: DocumentType[]
  work_title?: string | null
  work_place?: string | null
  district?: string | null
  reference?: string | null
  education_title?: string | null
  education_place?: string | null
  education_group?: string | null
}

export type UserImportType = {
  id: string
  first_name: string
  last_name: string
  middle_name: string
  birthday: string
  phone: string
  schools: UserSchoolCreateType[]
  classroom_name?: string | null
  parents: UserImportType[]
}

export type UserRatingType = {
  value: number
  rating: number
  user: UserType
  classroom: ClassroomListType | null
  school: SchoolListType | null
}

export type DocumentType = {
  key: string
  number: string | null
  date: string | null
}
