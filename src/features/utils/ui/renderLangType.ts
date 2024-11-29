import i18n from 'i18next'

export const renderLangType = (lang: string | null) => {
  if (lang === null) return
  switch (lang) {
    case 'tm':
      return i18n.t('LangTypeTm')
    case 'ru':
      return i18n.t('LangTypeRu')
    case 'en':
      return i18n.t('LangTypeEn')
    default:
      return null
  }
}
