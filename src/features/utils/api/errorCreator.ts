export const createApiErrorObj = (error: string | null) => {
  const errArr = {
    error: {},
    errors: [
      {
        code: error,
        comment: '',
        key: ''
      }
    ]
  }

  return errArr
}
