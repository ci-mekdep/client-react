import { UserCreateType, UserType } from 'src/entities/school/UserType'

export const convertUserData = (data: UserType, user_documents: string[]) => {
  const userCreate = <UserCreateType>{}

  userCreate.id = data.id
  userCreate.first_name = data.first_name
  userCreate.last_name = data.last_name
  userCreate.middle_name = data.middle_name
  userCreate.status = data.status
  userCreate.username = data.username
  userCreate.birthday = data.birthday
  userCreate.gender = data.gender
  userCreate.phone = data.phone
  userCreate.email = data.email
  userCreate.password = ''
  userCreate.address = data.address
  userCreate.work_title = data.work_title
  userCreate.work_place = data.work_place
  userCreate.district = data.district
  userCreate.reference = data.reference
  userCreate.education_title = data.education_title
  userCreate.education_place = data.education_place
  userCreate.education_group = data.education_group

  const documentsArr: any = []
  user_documents?.map(item => {
    const oldDocument = data.documents && data.documents.find(doc => doc.key === item)
    const obj = {
      key: item,
      number: oldDocument?.number || null,
      date: oldDocument?.date || null
    }
    documentsArr.push(obj)
  })
  userCreate.documents = documentsArr

  return userCreate
}
