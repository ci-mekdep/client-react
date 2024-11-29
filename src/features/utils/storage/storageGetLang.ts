const storageGetLang = () => {
  let lang
  if (typeof window !== 'undefined') {
    lang = localStorage.getItem('i18nextLng')
  }

  if (lang === undefined) {
    return null
  } else {
    return lang
  }
}

export default storageGetLang
