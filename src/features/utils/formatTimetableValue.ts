export const formatTimetableValue = (events: any, dayLessons: number) => {
  const newArr: any = []
  const rows = 6

  for (let i = 0; i < rows; i++) {
    newArr[i] = []
    for (let j = 0; j < dayLessons; j++) {
      newArr[i][j] = ''
    }
  }

  const sortedEvents = events.sort((objA: any, objB: any) => Number(objA.start) - Number(objB.start))

  for (let k = 0; k < sortedEvents.length; k++) {
    const row = sortedEvents[k].start.getDate() - 12
    const column = sortedEvents[k].start.getHours() - 1
    newArr[row][column] = sortedEvents[k].subject_id
  }

  return newArr
}
