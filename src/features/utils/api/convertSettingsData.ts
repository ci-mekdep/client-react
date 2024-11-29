import { AppSettingsUpdateType } from 'src/entities/app/AppSettingsType'

export const convertSettingsData = (data: AppSettingsUpdateType) => {
  const settingsData = <AppSettingsUpdateType>{}

  settingsData.alert_message = data.alert_message
  settingsData.grade_update_minutes = data.grade_update_minutes
  settingsData.absent_update_minutes = data.absent_update_minutes
  settingsData.delayed_grade_update_hours = data.delayed_grade_update_hours
  settingsData.timetable_update_week_available = data.timetable_update_week_available
  settingsData.is_archive = data.is_archive

  return settingsData
}
