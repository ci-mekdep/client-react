import { ContactItemCreateType, ContactItemType } from 'src/entities/app/ContactItemsType'

export const convertContactItemData = (data: ContactItemType) => {
  const contactItemCreate = <ContactItemCreateType>{}

  contactItemCreate.id = data.id
  contactItemCreate.user_id = data.user_id
  contactItemCreate.school_id = data.school_id
  contactItemCreate.message = data.message
  contactItemCreate.type = data.type
  contactItemCreate.status = data.status
  contactItemCreate.files = data.files
  contactItemCreate.birth_cert_number = data.birth_cert_number
  contactItemCreate.classroom_name = data.classroom_name
  contactItemCreate.parent_phone = data.parent_phone
  contactItemCreate.note = data.note

  if (data.related) {
    contactItemCreate.related_id = data.related.id
  }

  return contactItemCreate
}
