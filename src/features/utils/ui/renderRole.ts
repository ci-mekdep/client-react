import i18n from 'i18next'
import { RoleCode } from 'src/entities/app/Enums'

export const renderRole = (role: RoleCode | null | string) => {
  if (role === null || role?.length === 0) return
  switch (role) {
    case 'admin':
      return i18n.t('RoleAdmin')
    case 'organization':
      return i18n.t('RoleOrganization')
    case 'principal':
      return i18n.t('RolePrincipal')
    case 'operator':
      return i18n.t('RoleOperator')
    case 'teacher':
      return i18n.t('RoleTeacher')
    case 'parent':
      return i18n.t('RoleParent')
    case 'student':
      return i18n.t('RoleStudent')
    default:
      return null
  }
}
