import i18n from 'i18next'

export const renderAgeCategory = (age_category: string | null) => {
  if (age_category === null || age_category?.length === 0) return ''
  switch (age_category) {
    case 'adult':
      return i18n.t('Adults')
    case 'kid':
      return i18n.t('Kids')
    default:
      return ''
  }
}
