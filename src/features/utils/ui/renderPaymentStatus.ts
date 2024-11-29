import i18n from 'i18next'

export const renderPaymentStatus = (status: string | null) => {
  if (status === null) return
  switch (status) {
    case 'processing':
      return i18n.t('ProcessingStatus')
    case 'completed':
      return i18n.t('CompletedStatus')
    case 'failed':
      return i18n.t('FailedStatus')
    default:
      return null
  }
}
