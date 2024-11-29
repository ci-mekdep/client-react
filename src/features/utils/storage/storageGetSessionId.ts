const storageGetSessionId = () => {
  const session_id = window.localStorage.getItem('sessionId')

  if (session_id === undefined) {
    return null
  } else {
    return session_id
  }
}

export default storageGetSessionId
