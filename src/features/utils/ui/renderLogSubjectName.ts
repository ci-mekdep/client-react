import i18n from 'i18next'

export const renderLogSubjectName = (subject_name: string | null) => {
  if (subject_name === null || subject_name?.length === 0) return ''
  switch (subject_name) {
    case 'users':
      return i18n.t('LogSubjectNameUsers')
    case 'schools':
      return i18n.t('LogSubjectNameSchools')
    case 'classrooms':
      return i18n.t('LogSubjectNameClassrooms')
    case 'lessons':
      return i18n.t('LogSubjectNameLessons')
    case 'grades':
      return i18n.t('LogSubjectNameGrades')
    case 'absents':
      return i18n.t('LogSubjectNameAbsents')
    case 'timetables':
      return i18n.t('LogSubjectNameTimetables')
    case 'subjects':
      return i18n.t('LogSubjectNameSubjects')
    case 'shifts':
      return i18n.t('LogSubjectNameShifts')
    case 'topics':
      return i18n.t('LogSubjectNameTopics')
    case 'periods':
      return i18n.t('LogSubjectNamePeriods')
    case 'payments':
      return i18n.t('LogSubjectNamePayments')
    case 'books':
      return i18n.t('LogSubjectNameBooks')
    case 'base_subjects':
      return i18n.t('LogSubjectNameBaseSubjects')
    case 'reports':
      return i18n.t('LogSubjectNameReports')
    case 'report_items':
      return i18n.t('LogSubjectNameReportItems')
    case 'sessions':
      return i18n.t('LogSubjectNameSessions')
    default:
      return ''
  }
}
