import { SchoolListType } from 'src/entities/school/SchoolType'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { ClassroomListType } from 'src/entities/classroom/ClassroomType'

export const convertSchoolToLiteModel = (data: SchoolListType | ClassroomListType | null) => {
  if (data !== null) {
    const model = <LiteModelType>{}
    const name = data?.name ?? ''

    model.key = data.id.toString()
    model.value = name

    return model
  } else {
    return null
  }
}
