export type ReportRowType = {
  classroom: string
  classroom_id: string
  percent: number | null
  region: string
  region_code: string
  school: string
  school_code: string
  school_id: string
  user: string
  user_id: string
  values: string[]
}

export type ReportTotalType = {
  title: string
  value: string
}

export type ReportDataFormType = {
  key: string
  value: string | boolean
}

export type ReportFormOptionScheme = {
  key: string
  title: string
  type: string
  value: string | null
  school_id: string | null
  options?: string[]
}

export type ReportType = {
  headers: string[]
  rows: ReportRowType[]
  totals: ReportTotalType[]
  has_detail: boolean
}
