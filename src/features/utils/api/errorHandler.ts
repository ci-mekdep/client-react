import i18n from 'i18next'
import { ErrorType } from 'src/entities/app/GeneralTypes'

const handleErrorKey = (str: string) => {
  if (str.includes('.')) {
    const parts = str.split('.')
    const lastPart = parts[parts.length - 1]

    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1)
  }

  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const errorHandler = (error: ErrorType) => {
  const errorObj = error.errors && error.errors[0]
  if (!errorObj || !errorObj.code) return i18n.t('ApiErrorDefault')

  switch (errorObj.code) {
    case 'invalid':
      if (errorObj.key) {
        return `${i18n.t('ApiErrorInvalid')} (${i18n.t(handleErrorKey(errorObj.key))})`
      } else return i18n.t('ApiErrorInvalid')
    case 'required':
      if (errorObj.key) {
        return `${i18n.t('ApiErrorRequired')} (${i18n.t(handleErrorKey(errorObj.key))})`
      } else return i18n.t('ApiErrorRequired')
    case 'not_set':
      if (errorObj.key) {
        return `${i18n.t('ApiErrorNotSet')} (${i18n.t(handleErrorKey(errorObj.key))})`
      } else return i18n.t('ApiErrorNotSet')
    case 'not_exists':
      if (errorObj.key) {
        return `${i18n.t('ApiErrorNotExists')} (${i18n.t(handleErrorKey(errorObj.key))})`
      } else return i18n.t('ApiErrorNotExists')
    case 'expired':
      if (errorObj.key) {
        return `${i18n.t('ApiErrorExpired')} (${i18n.t(handleErrorKey(errorObj.key))})`
      } else return i18n.t('ApiErrorExpired')
    case 'not_found':
      if (errorObj.key) {
        return `${i18n.t('ApiErrorNotFound')} (${i18n.t(handleErrorKey(errorObj.key))})`
      } else return i18n.t('ApiErrorNotFound')
    case 'not_paid':
      if (errorObj.key) {
        return `${i18n.t('ApiErrorNotPaid')} (${i18n.t(handleErrorKey(errorObj.key))})`
      } else return i18n.t('ApiErrorNotPaid')
    case 'unauthorized':
      if (errorObj.key) {
        return `${i18n.t('ApiErrorUnauthorized')} (${i18n.t(handleErrorKey(errorObj.key))})`
      } else return i18n.t('ApiErrorUnauthorized')
    case 'forbidden':
      if (errorObj.key) {
        return `${i18n.t('ApiErrorForbidden')} (${i18n.t(handleErrorKey(errorObj.key))})`
      } else return i18n.t('ApiErrorForbidden')
    case 'unique':
      if (errorObj.key) {
        return `${i18n.t('ApiErrorUnique')} (${i18n.t(handleErrorKey(errorObj.key))})`
      } else return i18n.t('ApiErrorUnique')
    case 'exceeded':
      if (errorObj.key) {
        return `${i18n.t('ApiErrorExceeded')} (${i18n.t(handleErrorKey(errorObj.key))})`
      } else return i18n.t('ApiErrorExceeded')
    case 'down':
      if (errorObj.key) {
        return `${i18n.t('ApiErrorDown')} (${i18n.t(handleErrorKey(errorObj.key))})`
      } else return i18n.t('ApiErrorDown')
    default:
      if (errorObj.key) {
        return `${i18n.t('ApiErrorDefault')} (${i18n.t(handleErrorKey(errorObj.key))})`
      } else return i18n.t('ApiErrorDefault')
  }
}

export const errorTextHandler = (error_code: string | null | undefined) => {
  switch (error_code) {
    case 'invalid':
      return i18n.t('ApiErrorInvalid')
    case 'required':
      return i18n.t('ApiErrorRequired')
    case 'not_set':
      return i18n.t('ApiErrorNotSet')
    case 'not_exists':
      return i18n.t('ApiErrorNotExists')
    case 'expired':
      return i18n.t('ApiErrorExpired')
    case 'not_found':
      return i18n.t('ApiErrorNotFound')
    case 'not_paid':
      return i18n.t('ApiErrorNotPaid')
    case 'unauthorized':
      return i18n.t('ApiErrorUnauthorized')
    case 'forbidden':
      return i18n.t('ApiErrorForbidden')
    case 'unique':
      return i18n.t('ApiErrorUnique')
    case 'exceeded':
      return i18n.t('ApiErrorExceeded')
    case 'down':
      return i18n.t('ApiErrorDown')
    default:
      return i18n.t('ApiErrorDefault')
  }
}
