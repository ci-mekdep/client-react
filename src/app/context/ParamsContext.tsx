// ** React Imports
import { createContext, useState, ReactNode } from 'react'

// ** Types
import { ListParams, ParamsType } from './types'

// ** Defaults
const defaultProvider: ParamsType = {
  usersParams: {},
  booksParams: {},
  topicsParams: {},
  shiftsParams: {},
  schoolsParams: {},
  periodsParams: {},
  subjectsParams: {},
  baseSubjectsParams: {},
  timetablesParams: {},
  classroomsParams: {},
  contactItemsParams: {},
  contactItemsReportParams: {},
  reportsParams: {},
  reportFormsParams: {},
  dashboardParams: {},
  paymentsParams: {},
  paymentsReportParams: {},
  toolsExportParams: {},
  toolsLogsParams: {},
  teacherExcusesParams: {},
  schoolTransfersParams: {},
  setSearchParams: () => null,
  clearAllSearchParams: () => null
}

const ParamsContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const ParamsProvider = ({ children }: Props) => {
  // ** States
  const [usersParams, setUsersParams] = useState<ListParams>(defaultProvider.usersParams)
  const [booksParams, setBooksParams] = useState<ListParams>(defaultProvider.booksParams)
  const [topicsParams, setTopicsParams] = useState<ListParams>(defaultProvider.topicsParams)
  const [shiftsParams, setShiftsParams] = useState<ListParams>(defaultProvider.shiftsParams)
  const [schoolsParams, setSchoolsParams] = useState<ListParams>(defaultProvider.schoolsParams)
  const [periodsParams, setPeriodsParams] = useState<ListParams>(defaultProvider.periodsParams)
  const [subjectsParams, setSubjectsParams] = useState<ListParams>(defaultProvider.subjectsParams)
  const [baseSubjectsParams, setBaseSubjectsParams] = useState<ListParams>(defaultProvider.baseSubjectsParams)
  const [timetablesParams, setTimetablesParams] = useState<ListParams>(defaultProvider.timetablesParams)
  const [classroomsParams, setClassroomsParams] = useState<ListParams>(defaultProvider.classroomsParams)
  const [contactItemsParams, setContactItemsParams] = useState<ListParams>(defaultProvider.contactItemsParams)
  const [contactItemsReportParams, setContactItemsReportParams] = useState<ListParams>(
    defaultProvider.contactItemsReportParams
  )
  const [reportsParams, setReportsParams] = useState<ListParams>(defaultProvider.reportsParams)
  const [reportFormsParams, setReportFormsParams] = useState<ListParams>(defaultProvider.reportFormsParams)
  const [paymentsParams, setPaymentsParams] = useState<ListParams>(defaultProvider.paymentsParams)
  const [paymentsReportParams, setPaymentsReportParams] = useState<ListParams>(defaultProvider.paymentsReportParams)
  const [toolsExportParams, setToolsExportParams] = useState<ListParams>(defaultProvider.toolsExportParams)
  const [toolsLogsParams, setToolsLogsParams] = useState<ListParams>(defaultProvider.toolsLogsParams)
  const [teacherExcusesParams, setTeacherExcusesParams] = useState<ListParams>(defaultProvider.teacherExcusesParams)
  const [schoolTransfersParams, setSchoolTransfersParams] = useState<ListParams>(defaultProvider.schoolTransfersParams)
  const [dashboardParams, setDashboardParams] = useState<ListParams>(defaultProvider.dashboardParams)

  const setSearchParams = (paramType: string, params: any) => {
    if (paramType === 'usersParams') {
      setUsersParams(params)
    }
    if (paramType === 'booksParams') {
      setBooksParams(params)
    }
    if (paramType === 'topicsParams') {
      setTopicsParams(params)
    }
    if (paramType === 'shiftsParams') {
      setShiftsParams(params)
    }
    if (paramType === 'schoolsParams') {
      setSchoolsParams(params)
    }
    if (paramType === 'periodsParams') {
      setPeriodsParams(params)
    }
    if (paramType === 'subjectsParams') {
      setSubjectsParams(params)
    }
    if (paramType === 'baseSubjectsParams') {
      setBaseSubjectsParams(params)
    }
    if (paramType === 'timetablesParams') {
      setTimetablesParams(params)
    }
    if (paramType === 'classroomsParams') {
      setClassroomsParams(params)
    }
    if (paramType === 'contactItemsParams') {
      setContactItemsParams(params)
    }
    if (paramType === 'contactItemsReportParams') {
      setContactItemsReportParams(params)
    }
    if (paramType === 'reportsParams') {
      setReportsParams(params)
    }
    if (paramType === 'reportFormsParams') {
      setReportFormsParams(params)
    }
    if (paramType === 'paymentsParams') {
      setPaymentsParams(params)
    }
    if (paramType === 'paymentsReportParams') {
      setPaymentsReportParams(params)
    }
    if (paramType === 'toolsExportParams') {
      setToolsExportParams(params)
    }
    if (paramType === 'toolsLogsParams') {
      setToolsLogsParams(params)
    }
    if (paramType === 'teacherExcusesParams') {
      setTeacherExcusesParams(params)
    }
    if (paramType === 'schoolTransfersParams') {
      setSchoolTransfersParams(params)
    }
    if (paramType === 'dashboardParams') {
      setDashboardParams(params)
    }
  }

  const clearAllSearchParams = () => {
    setUsersParams(() => ({}))
    setBooksParams(() => ({}))
    setTopicsParams(() => ({}))
    setShiftsParams(() => ({}))
    setSchoolsParams(() => ({}))
    setPeriodsParams(() => ({}))
    setSubjectsParams(() => ({}))
    setBaseSubjectsParams(() => ({}))
    setTimetablesParams(() => ({}))
    setClassroomsParams(() => ({}))
    setContactItemsParams(() => ({}))
    setContactItemsReportParams(() => ({}))
    setReportsParams(() => ({}))
    setReportFormsParams(() => ({}))
    setPaymentsParams(() => ({}))
    setPaymentsReportParams(() => ({}))
    setToolsExportParams(() => ({}))
    setToolsLogsParams(() => ({}))
    setTeacherExcusesParams(() => ({}))
    setSchoolTransfersParams(() => ({}))
    setDashboardParams(() => ({}))
  }

  const values = {
    usersParams,
    booksParams,
    topicsParams,
    shiftsParams,
    schoolsParams,
    periodsParams,
    subjectsParams,
    baseSubjectsParams,
    timetablesParams,
    classroomsParams,
    contactItemsParams,
    contactItemsReportParams,
    reportsParams,
    reportFormsParams,
    paymentsParams,
    paymentsReportParams,
    toolsExportParams,
    toolsLogsParams,
    teacherExcusesParams,
    schoolTransfersParams,
    dashboardParams,
    setSearchParams,
    clearAllSearchParams
  }

  return <ParamsContext.Provider value={values}>{children}</ParamsContext.Provider>
}

export { ParamsContext, ParamsProvider }
