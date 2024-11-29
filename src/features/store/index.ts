// ** Toolkit imports
import { combineReducers, configureStore } from '@reduxjs/toolkit'

// ** Reducers
import user from './apps/user'
import login from './apps/login'
import shifts from './apps/shifts'
import topics from './apps/topics'
import schools from './apps/school'
import regions from './apps/regions'
import publicRegions from './apps/publicRegions'
import publicSchools from './apps/publicSchools'
import periods from './apps/periods'
import profile from './apps/profile'
import sessions from './apps/sessions'
import subjects from './apps/subjects'
import baseSubjects from './apps/baseSubjects'
import subjectExams from './apps/subjectExams'
import teacherExcuses from './apps/teacherExcuses'
import settings from './apps/settings'
import settingsPages from './apps/settings/pages'
import settingsOnline from './apps/settings/online'
import settingsReport from './apps/settings/report'
import toolLogs from './apps/tools/logs'
import journal from './apps/journal'
import rating from './apps/school/rating'
import classrooms from './apps/classrooms'
import timetables from './apps/timetables'
import contactItems from './apps/contactItems'
import schoolTransfers from './apps/schoolTransfers'
import dashboards from './apps/dashboards'
import books from './apps/books'
import payments from './apps/payments'
import reports from './apps/tools/reports'
import reportForms from './apps/tools/reportForms'
import dataReports from './apps/tools/data'
import reportExams from './apps/tools/reports/exams'
import reportPeriods from './apps/tools/reports/periods'
import reportJournal from './apps/tools/reports/journal'
import reportParents from './apps/tools/reports/parents'
import reportStudents from './apps/tools/reports/students'
import reportAttendance from './apps/tools/reports/attendance'
import inboxNotifications from './apps/inboxNotifications'
import outboxNotifications from './apps/outboxNotifications'

export const RESET_STORE = 'RESET_STORE'

const appReducer = combineReducers({
  user,
  login,
  shifts,
  topics,
  schools,
  regions,
  publicRegions,
  publicSchools,
  periods,
  profile,
  subjects,
  baseSubjects,
  subjectExams,
  teacherExcuses,
  settings,
  settingsPages,
  settingsOnline,
  settingsReport,
  sessions,
  toolLogs,
  journal,
  rating,
  classrooms,
  timetables,
  contactItems,
  schoolTransfers,
  dashboards,
  books,
  payments,
  reports,
  reportForms,
  dataReports,
  reportExams,
  reportPeriods,
  reportJournal,
  reportParents,
  reportStudents,
  reportAttendance,
  inboxNotifications,
  outboxNotifications
})

const rootReducer = (state: any, action: any) => {
  if (action.type === RESET_STORE) {
    state = undefined
  }

  return appReducer(state, action)
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
