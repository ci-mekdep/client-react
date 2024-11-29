const storageGetToken = () => {
  const token = window.localStorage.getItem('accessToken')

  if (token === null) {
    return null
  } else {
    return token
  }
}

export default storageGetToken
