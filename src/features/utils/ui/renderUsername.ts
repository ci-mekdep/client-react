export const renderUsername = (username: string | undefined | null) => {
  if (username === null || !username || username.length === 0) {
    return
  } else {
    return '@' + username
  }
}
