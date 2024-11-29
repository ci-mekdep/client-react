import i18n from 'i18next'

export const renderTeacherExcuseReason = (reason: string | null) => {
  if (reason === null || reason?.length === 0) return ''
  switch (reason) {
    case 'excuse_vacation':
      return i18n.t('TeacherExcuseVacation')
    case 'excuse_unpaid':
      return i18n.t('TeacherExcuseUnpaid')
    case 'excuse_paid':
      return i18n.t('TeacherExcusePaid')
    case 'excuse_business_trip':
      return i18n.t('TeacherExcuseBusiness')
    case 'excuse_study_trip':
      return i18n.t('TeacherExcuseStudy')
    case 'excuse_maternity':
      return i18n.t('TeacherExcuseMaternity')
    case 'excuse_ill':
      return i18n.t('TeacherExcuseIll')
    default:
      return ''
  }
}
