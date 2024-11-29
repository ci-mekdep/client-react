import format from 'date-fns/format'
import { UserType } from 'src/entities/school/UserType'
import { renderUserFullname } from './ui/renderUserFullname'
import i18n from 'i18next'
import { SubjectListType } from 'src/entities/classroom/SubjectType'

export const generateJournalGradesTable = (data: any, quarter: string, classroom: any, subject: any) => {
  const headers: any = {}
  const tooltips: any = {}
  headers['key1'] = i18n.t('RoleStudent') + ' - ' + classroom.value + ' ' + subject.name

  data.lessons.map((lesson: any, index: number) => {
    let tooltipData = null
    if (lesson.lesson.title) {
      tooltipData = 'Tema: ' + lesson.lesson.title + '\n'
    }
    if (lesson.lesson.assignment) {
      if (tooltipData) {
        tooltipData += 'Öý işi: ' + lesson.lesson.assignment?.title
      } else {
        tooltipData = 'Öý işi: ' + lesson.lesson.assignment?.title
      }
    }
    tooltips[`key${index + 2}`] = tooltipData
    headers[`key${index + 2}`] = format(new Date(lesson.lesson?.date), 'dd.MM')
  })
  headers['quarter'] = i18n.t('Quarter') + ' ' + quarter

  const rows: any = []
  data.students.map((student: UserType) => {
    let obj: any = {}
    obj['key1'] = renderUserFullname(student.last_name, student.first_name, student.middle_name)

    data.lessons.map((lesson: any, innerIndex: number) => {
      const grade = lesson.grades.find((grade: any) => grade.student_id === student.id)
      const absent = lesson.absents.find((absent: any) => absent.student_id === student.id)
      obj[`key${innerIndex + 2}`] = grade ? grade.value && grade.value.toString() : absent ? 'GM' : ''
    })

    const periodGrade = data.period_grades.find((period_grade: any) => period_grade.student_id === student.id)
    obj['quarter'] = periodGrade ? periodGrade.grade_value : ''

    rows.push(obj)
    obj = {}
  })

  return [headers, rows, tooltips]
}

export const generateQuarterTable = (data: any, classroom: any, subject: any) => {
  const headers: any = {}
  headers['student'] = i18n.t('RoleStudent') + ' - ' + classroom.value + ' ' + subject.name
  headers['period1'] = 'I'
  headers['period2'] = 'II'
  headers['period3'] = 'III'
  headers['period4'] = 'IV'
  headers['exam'] = i18n.t('Exam')
  headers['final'] = i18n.t('Final')

  const rows: string[] = []

  data.map((data: any) => {
    let obj: any = {}
    obj['student'] = renderUserFullname(data.student.last_name, data.student.first_name, data.student.middle_name)

    obj['period1'] = data.periods['1'].grade_value !== null ? data.periods['1'].grade_value : ''
    obj['period2'] = data.periods['2'].grade_value !== null ? data.periods['2'].grade_value : ''
    obj['period3'] = data.periods['3'].grade_value !== null ? data.periods['3'].grade_value : ''
    obj['period4'] = data.periods['4'].grade_value !== null ? data.periods['4'].grade_value : ''

    obj['exam'] = data.exam && data.exam.grade_value ? data.exam.grade_value : ''
    obj['final'] = data.final && data.final.grade_value ? data.final.grade_value : ''

    rows.push(obj)
    obj = {}
  })

  return [headers, rows]
}

export const generateFinalTable = (data: any, classroom: any) => {
  const headers: any = {}
  headers['key1'] = i18n.t('RoleStudent') + ' - ' + classroom.value
  data.subjects.map((subject: SubjectListType, index: number) => {
    headers[`key${index + 2}`] = subject.name
  })

  const rows: any = []
  data.students.map((row: any) => {
    let obj: any = {}
    obj['key1'] = renderUserFullname(row.student.last_name, row.student.first_name, row.student.middle_name)

    row.subjects.forEach((row: any) => {
      const subjectIndex = data.subjects.findIndex((s: SubjectListType) => s.id === row.subject_id)
      if (subjectIndex !== -1) {
        obj[`key${subjectIndex + 2}`] = row.period_grade?.grade_value || ''
      }
    })

    rows.push(obj)
    obj = {}
  })

  return [headers, rows]
}

export const generateFinalExamsTable = (data: any, classroom: any) => {
  const headers: any = {}
  headers['key1'] = i18n.t('RoleStudent') + ' - ' + classroom.value
  data.exams.map((exam: any, index: number) => {
    headers[`key${index + 2}`] = exam.name
  })

  const rows: any = []

  data.students.map((row: any) => {
    let obj: any = {}
    obj['key1'] = renderUserFullname(row.student.last_name, row.student.first_name, row.student.middle_name)

    row.subjects.forEach((item: any) => {
      item.exam_grades &&
        item.exam_grades.forEach((exam_grade: any) => {
          const examIndex = data.exams.findIndex((e: any) => e.id === exam_grade.exam_id)
          if (examIndex !== -1) {
            obj[`key${examIndex + 2}`] = exam_grade.grade_value || ''
          }
        })
    })

    rows.push(obj)
    obj = {}
  })

  return [headers, rows]
}
