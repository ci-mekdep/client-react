import { SubjectListType } from 'src/entities/classroom/SubjectType'
import { TimetableListType } from 'src/entities/classroom/TimetableType'
import { convertTmChars } from './convertTmChars'

export const convertAscData = (data: any, timetable: TimetableListType | null, allSubjects: SubjectListType[]) => {
  if (!timetable) {
    return [['Timetable is null'], null]
  }

  const currentClassroom = timetable?.classroom

  const subjects = data.subjects.subject.map((sub: any) => {
    return {
      id: sub._attributes.id,
      name: sub._attributes.name
    }
  })

  const classrooms = data.classes.class
    .map((sub: any) => {
      return {
        id: sub._attributes.id,
        name: sub._attributes.name
      }
    })
    .filter((classroom: any) => classroom.name === currentClassroom?.name)

  const lessons = data.lessons.lesson
    .map((lesson: any) => {
      return {
        id: lesson._attributes.id,
        classroom: classrooms.find((classroom: any) => classroom.id === lesson._attributes.classids)?.name || null,
        subject: subjects.find((subject: any) => subject.id === lesson._attributes.subjectid)?.name || null
      }
    })
    .filter((l: any) => l.classroom !== null)
    .filter((l: any) => l.subject !== null)

  const cards = data.cards.card
    .map((card: any) => {
      return {
        lesson: lessons.find((lesson: any) => lesson.id === card._attributes.lessonid) || null,
        day: card._attributes.days.indexOf('1'),
        lessonNumber: parseInt(card._attributes.period) - 1
      }
    })
    .filter((c: any) => c.lesson !== null)

  const length = timetable?.shift.value[0].length
  let value: string[][] = []
  value = Array.from({ length: 6 }, () => Array.from({ length: length }, () => ''))

  cards.forEach((card: any) => {
    const {
      day,
      lessonNumber,
      lesson: { subject }
    } = card

    if (!value[day]) {
      value[day] = []
    }

    value[day][lessonNumber] = subject
  })

  const notExistingSubjects: string[] = []

  let arr: string[][] = []
  arr = Array.from({ length: 6 }, () => Array.from({ length: length }, () => ''))

  value.map((val: string[], index: number) => {
    val.map((sub: string, innerIndex: number) => {
      const isInSubjectsArr = allSubjects.some(
        (subject: SubjectListType) => convertTmChars(subject.name) === convertTmChars(sub)
      )
      if (sub !== '' && !isInSubjectsArr) {
        notExistingSubjects.push(sub as string)
        arr[index][innerIndex] = ''
      } else {
        const subject = allSubjects.find(
          (subject: SubjectListType) => convertTmChars(subject.name) === convertTmChars(sub)
        )
        if (subject) {
          arr[index][innerIndex] = subject?.id
        } else {
          arr[index][innerIndex] = ''
        }
      }
    })
  })

  return [notExistingSubjects, arr]
}
