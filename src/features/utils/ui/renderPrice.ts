export const renderPrice = (price: number | null | undefined) => {
  if (typeof price !== 'number' || price === null || price === undefined) {
    return ''
  } else {
    return Math.floor(price / 100) + ' TMT'
  }
}
