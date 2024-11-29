import { ShiftGenerateType } from 'src/entities/app/GeneralTypes'

const generateShift = (data: ShiftGenerateType, daysIndexes: number[]) => {
  const { startTime, lessonDuration, maxLessonsPerDay, shortBreakDuration, longBreakDuration, bigBreakIndex } = data

  const shift: any = new Array(6).fill(null).map(() => [])

  for (const day of daysIndexes) {
    const dayShift = []

    let firstLessonEndTime = new Date(startTime.getTime() + lessonDuration * 60 * 1000)
    dayShift.push([
      startTime.getHours() + ':' + (startTime.getMinutes() < 10 ? '0' : '') + startTime.getMinutes(),
      firstLessonEndTime.getHours() +
        ':' +
        (firstLessonEndTime.getMinutes() < 10 ? '0' : '') +
        firstLessonEndTime.getMinutes()
    ])

    for (let i = 1; i < maxLessonsPerDay; i++) {
      let nextLessonStartTime = new Date(firstLessonEndTime.getTime() + shortBreakDuration * 60 * 1000)
      let nextLessonEndTime = new Date(nextLessonStartTime.getTime() + lessonDuration * 60 * 1000)

      if (i === bigBreakIndex) {
        nextLessonStartTime = new Date(
          nextLessonStartTime.getTime() + (longBreakDuration - shortBreakDuration) * 60 * 1000
        )
        nextLessonEndTime = new Date(nextLessonStartTime.getTime() + lessonDuration * 60 * 1000)
      }

      dayShift.push([
        nextLessonStartTime.getHours() +
          ':' +
          (nextLessonStartTime.getMinutes() < 10 ? '0' : '') +
          nextLessonStartTime.getMinutes(),
        nextLessonEndTime.getHours() +
          ':' +
          (nextLessonEndTime.getMinutes() < 10 ? '0' : '') +
          nextLessonEndTime.getMinutes()
      ])
      firstLessonEndTime = nextLessonEndTime
    }

    shift[day] = dayShift
  }

  const newShift = []

  for (let i = 0; i < maxLessonsPerDay; i++) {
    const column = []

    for (let j = 0; j < shift.length; j++) {
      if (shift[j].length === 0 || !shift[j][i]) {
        column.push([])
      } else {
        column.push(shift[j][i])
      }
    }

    newShift.push(column)
  }

  return newShift
}

export default generateShift
