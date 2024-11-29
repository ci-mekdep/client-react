export const convertLessonHours = (numbers: number[] | null) => {
  if (numbers) {
    if (numbers.length === 1) {
      return `${numbers[0]}`
    } else {
      const start = numbers[0]
      const end = numbers[numbers.length - 1]

      return `${start}-${end}`
    }
  } else {
    return ''
  }
}
