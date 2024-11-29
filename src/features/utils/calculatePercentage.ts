export const calculatePercentage = (max: number, number: number) => {
  if (max === 0 || max === null) return 0

  return Math.round((number / max) * 100)
}
