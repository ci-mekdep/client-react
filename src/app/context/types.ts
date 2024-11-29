import { RoleCode } from 'src/entities/app/Enums'
import { UserType } from 'src/entities/school/UserType'
import { SchoolType } from 'src/entities/school/SchoolType'
import { UserSchoolLiteType } from 'src/entities/school/UserSchoolType'
import { PeriodType } from 'src/entities/school/PeriodType'
import { ErrorType } from 'src/entities/app/GeneralTypes'

export type ErrCallbackType = (err: ErrorType) => void

export type LoginParams = {
  login: string
  password?: string
  otp?: string
  roles_priority?: string[]
  device_token?: string
  school_id?: string | null
}

export type AuthValuesType = {
  current_role: RoleCode | string | null
  current_school: SchoolType | null
  current_region: SchoolType | null
  current_period: PeriodType | null
  is_secondary_school: boolean | null
  loading: boolean
  logout: () => void
  user: UserType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserType | null) => void
  handleLogin: (params: LoginParams, errorCallback?: ErrCallbackType) => void
  removeData: () => void
  handleUpdateProfile: (
    school: UserSchoolLiteType,
    region: SchoolType,
    period: PeriodType,
    fcmToken: string,
    errorCallback?: ErrCallbackType
  ) => void | Promise<unknown>
}

export type ListParams = {
  [key: string]: string | string[] | null
}

export type ParamsType = {
  usersParams: ListParams
  booksParams: ListParams
  topicsParams: ListParams
  shiftsParams: ListParams
  schoolsParams: ListParams
  periodsParams: ListParams
  subjectsParams: ListParams
  baseSubjectsParams: ListParams
  timetablesParams: ListParams
  classroomsParams: ListParams
  contactItemsParams: ListParams
  contactItemsReportParams: ListParams
  reportsParams: ListParams
  reportFormsParams: ListParams
  dashboardParams: ListParams
  paymentsParams: ListParams
  paymentsReportParams: ListParams
  toolsExportParams: ListParams
  toolsLogsParams: ListParams
  teacherExcusesParams: ListParams
  schoolTransfersParams: ListParams
  setSearchParams: (paramType: string, params: any) => void
  clearAllSearchParams: () => void
}
