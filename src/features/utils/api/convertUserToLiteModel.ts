import { UserListType, UserType } from 'src/entities/school/UserType'
import { LiteModelType } from 'src/entities/app/GeneralTypes'

export const convertUserToLiteModel = (data: UserListType | UserType) => {
  const model = <LiteModelType>{}

  const firstName = data.first_name ?? ''
  const lastName = data.last_name ?? ''
  const middleName = data.middle_name ?? ''

  model.key = data.id
  model.value = `${lastName} ${firstName} ${middleName}`

  return model
}
