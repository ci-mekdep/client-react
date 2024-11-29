export const reverseArray = (arr: (string[] | null)[][]) => {
  const newArr = []

  for (let i = 0; i < arr[0]?.length; i++) {
    const column = []

    for (let j = 0; j < arr?.length; j++) {
      if (arr[j] !== null) {
        column.push(arr[j][i])
      } else {
        column.push(null)
      }
    }

    newArr.push(column)
  }

  return newArr
}
