import i18n from 'i18next'

export const renderQuestionType = (type: string | null) => {
  if (type === null || type?.length === 0) return
  switch (type) {
    case 'text':
      return i18n.t('TextInputType')
    case 'number':
      return i18n.t('NumberInputType')
    case 'select':
      return i18n.t('SelectInputType')
    case 'list':
      return i18n.t('ListInputType')
    default:
      return null
  }
}
