import i18n from 'i18next'

export const renderSchoolLevel = (level: string | null) => {
  if (level === null) return
  switch (level) {
    case 'normal':
      return i18n.t('SchoolLevelNormal')
    case 'special':
      return i18n.t('SchoolLevelSpecial')
    case 'professional':
      return i18n.t('SchoolLevelProfessional')
    default:
      return null
  }
}
