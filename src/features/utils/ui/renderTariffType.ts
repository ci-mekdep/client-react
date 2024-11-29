import i18n from 'i18next'

export const renderTariffType = (tariff_type: string | null) => {
  if (tariff_type === null) return
  switch (tariff_type) {
    case 'plus':
      return i18n.t('PlusTariff')
    case 'trial':
      return i18n.t('TrialTariff')
    default:
      return null
  }
}
