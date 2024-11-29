import i18n from 'i18next'

export const renderContactItemType = (type: string | null) => {
  if (type === null) return
  switch (type) {
    case 'review':
      return i18n.t('ContactTypeReview')
    case 'complaint':
      return i18n.t('ContactTypeComplaint')
    case 'suggestion':
      return i18n.t('ContactTypeSuggestion')
    case 'data_complaint':
      return i18n.t('ContactTypeDataComplaint')
    default:
      return null
  }
}

export const renderContactItemStatus = (status: string | null) => {
  if (status === null) return
  switch (status) {
    case 'waiting':
      return i18n.t('ContactStatusWaiting')
    case 'todo':
      return i18n.t('ContactStatusTodo')
    case 'processing':
      return i18n.t('ContactStatusProcessing')
    case 'done':
      return i18n.t('ContactStatusDone')
    case 'backlog':
      return i18n.t('ContactStatusBacklog')
    case 'rejected':
      return i18n.t('ContactStatusRejected')
    default:
      return null
  }
}
