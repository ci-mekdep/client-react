import i18n from 'i18next'

export const renderLessonType = (type: string | null) => {
  if (type === null) return
  switch (type) {
    case 'new_topic':
      return i18n.t('LessonTypeNewTopic')
    case 'skills':
      return i18n.t('LessonTypeSkills')
    case 'test':
      return i18n.t('LessonTypeTest')
    case 'repeat':
      return i18n.t('LessonTypeRepeat')
    case 'lecture':
      return i18n.t('LessonTypeLecture')
    case 'practice':
      return i18n.t('LessonTypePractice')
    case 'mix':
      return i18n.t('LessonTypeMix')
    case 'exam':
      return i18n.t('LessonTypeExam')
    case 'essay':
      return i18n.t('LessonTypeEssay')
    default:
      return null
  }
}
