import { SessionType } from './SessionType'
import { SchoolListType } from '../school/SchoolType'
import { UserLogAction, UserLogSubject } from './Enums'
import { UserType } from '../school/UserType'

export type UserLogType = {
  id: string
  school: SchoolListType
  user: UserType
  session: SessionType
  subject_id: string
  subject_name: UserLogSubject
  subject_action: UserLogAction
  properties: any
  subject_description: string
  created_at: string
}
