export type RoleCode = 'admin' | 'organization' | 'principal' | 'operator' | 'teacher' | 'student' | 'parent' | ''

export type ClassroomTypeEnum =
  | 'informatics'
  | 'lang1'
  | 'lang2'
  | 'lang3'
  | 'lang4'
  | 'lang5'
  | 'labor1'
  | 'other1'
  | ''

export type Status = 'wait' | 'active' | 'blocked' | ''

export type AccountStatus = 'free' | 'plus'

export type AuthType = 'password' | '2fa-sms'

export type Gender = 1 | 2

export type UserLogSubject =
  | 'users'
  | 'schools'
  | 'classrooms'
  | 'lessons'
  | 'grades'
  | 'absents'
  | 'timetables'
  | 'subjects'
  | 'shifts'
  | 'topics'
  | 'periods'
  | 'payments'
  | 'books'
  | 'base_subjects'
  | 'reports'
  | 'report_items'

export type UserLogAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'update_password' | 'update_profile'
