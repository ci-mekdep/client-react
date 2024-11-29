import i18n from 'i18next'

export const renderClassroomLevel = (level: string | null) => {
  if (level === null) return
  switch (level) {
    case 'low':
      return i18n.t('ClassroomLevelLow')
    case 'medium':
      return i18n.t('ClassroomLevelMedium')
    case 'high':
      return i18n.t('ClassroomLevelHigh')
    default:
      return null
  }
}
