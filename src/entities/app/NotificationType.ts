import { UserListType } from '../school/UserType'

export type NotificationType = {
  id: string
  title: string
  content: string
  author_id: string
  author: UserListType
  files: string[]
  roles: string[]
  user_ids: string[] | null
  school_ids: string[]
  created_at: string
}

export type NotificationDetailType = {
  id: string
  title: string
  content: string
  author_id: string
  author: UserListType
  files: string[]
  roles: string[]
  user_ids: string[] | null
  school_ids: string[]
  created_at: string
  items: UserNotificationType[]
}

export type UserNotificationType = {
  id: string
  notification: NotificationType | null
  user_id: string
  read_at: string
  comment: string
  comment_files: string[]
  created_at: string
  user?: UserListType | null
  role?: string | null
}

export type NotificationCreateType = {
  id: string
  school_ids: string[]
  user_ids: string[]
  roles: string[]
  title: string
  content: string
  files: string[]
  files_delete: string[]
}

export type UserNotificationCreateType = {
  id?: string
  comment: string
  comment_files?: File[]
  comment_files_delete?: string[]
}
