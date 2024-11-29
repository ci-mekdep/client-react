import { SubjectListType } from 'src/entities/classroom/SubjectType'

export const resetWeekHoursSubjects = (
  subject_ids: string[][],
  subjects: SubjectListType[],
  shift: (string[] | null)[][]
) => {
  const subjectsArr = [...subjects].sort((a, b) => {
    if (a.parent_id === null && b.parent_id !== null) return -1
    if (a.parent_id !== null && b.parent_id === null) return 1

    return 0
  })
  const ids = subject_ids.flat()
  const newArr: SubjectListType[] = []
  const extraSubjectIds = subject_ids.map((day: string[]) => day.slice(shift.length).filter(num => num !== '')).flat()

  for (let i = 0; i < subjectsArr.length; i++) {
    let newSubject: SubjectListType = subjectsArr[i]

    const extraSubjectCount = extraSubjectIds.filter((c: string) => c === newSubject.id).length
    newSubject = { ...newSubject, week_hours: newSubject.week_hours + extraSubjectCount }

    if (newSubject.parent_id !== null) {
      const index = newArr.findIndex(obj => obj.id === newSubject.parent_id)
      if (index !== -1) {
        newArr[index].child_teacher = newSubject.second_teacher ? newSubject.second_teacher : newSubject.teacher
      }
      continue
    }

    if (newSubject.week_hours === null) {
      newSubject = { ...newSubject, week_hours: 0 }
    }
    const count = ids.filter((c: string) => c === newSubject.id).length
    if (count === 0) {
      newArr.push(newSubject)
      continue
    }
    newSubject = { ...newSubject, week_hours: newSubject.week_hours - count }

    newArr.push(newSubject)
  }

  return newArr
}
