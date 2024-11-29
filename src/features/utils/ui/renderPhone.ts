export const renderPhone = (phone: string | null | undefined) => {
  if ((phone && phone.length === 0) || phone === null || phone === undefined) {
    return ''
  } else {
    return '+993' + phone
  }
}
