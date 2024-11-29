// ** Returns initials from string
export const getInitials = (string: string) =>
  string.split(' ').reduce((response, word) => (response += word.slice(0, 1)), '')
