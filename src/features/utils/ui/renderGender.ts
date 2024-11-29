import i18n from 'i18next'

export const renderGender = (gender: number | null | undefined) => {
  if (gender === null || gender === undefined) return
  switch (gender) {
    case 1:
      return i18n.t('GenderMale')
    case 2:
      return i18n.t('GenderFemale')
    default:
      return ''
  }
}
