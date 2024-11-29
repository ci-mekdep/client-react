import i18n from 'i18next'

export const renderLogSubjectAction = (subject_action: string | null) => {
  if (subject_action === null || subject_action?.length === 0) return
  switch (subject_action) {
    case 'create':
      return i18n.t('LogSubjectActionCreate')
    case 'update':
      return i18n.t('LogSubjectActionUpdate')
    case 'delete':
      return i18n.t('LogSubjectActionDelete')
    case 'login':
      return i18n.t('LogSubjectActionLogin')
    case 'logout':
      return i18n.t('LogSubjectActionLogout')
    case 'update_password':
      return i18n.t('LogSubjectActionUpdatePassword')
    case 'update_profile':
      return i18n.t('LogSubjectActionUpdateProfile')
    default:
      return null
  }
}
