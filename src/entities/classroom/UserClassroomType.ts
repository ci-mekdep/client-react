import { ClassroomTypeEnum } from '../app/Enums'
import { ClassroomListType } from './ClassroomType'

export type UserClassroomType = {
  classroom_id: string
  user_id: string
  type: ClassroomTypeEnum | string | null
  type_key: number
}

export type UserClassroomCreateType = {
  type: ClassroomTypeEnum | string | null
  type_key: number | null
  classroom_id: string
}

export type UserClassroomModelCreateType = {
  type: ClassroomTypeEnum | string | null
  type_key: number | null
  classroom_id: ClassroomListType | null
}
