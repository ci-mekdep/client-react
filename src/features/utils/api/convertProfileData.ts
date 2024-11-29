import { UserCreateType, UserType } from 'src/entities/school/UserType'

export const convertProfileData = (data: UserType) => {
  const userCreate = <UserCreateType>{}

  userCreate.first_name = data.first_name
  userCreate.last_name = data.last_name
  userCreate.middle_name = data.middle_name
  userCreate.birthday = data.birthday
  userCreate.gender = data.gender
  userCreate.address = data.address
  userCreate.username = data.username
  userCreate.status = data.status
  userCreate.phone = data.phone
  userCreate.email = data.email

  return userCreate
}
