// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Next Import
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { useSelector } from 'react-redux'
import { fetchReports } from 'src/features/store/apps/tools/reports'
import { forwardRef, useContext, useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { ReportRowType, ReportTotalType } from 'src/entities/journal/ReportType'
import { exportReportToExcel } from 'src/features/utils/exportToExcel'
import format from 'date-fns/format'
import Error from 'src/widgets/general/Error'
import Translations from 'src/app/layouts/components/Translations'
import { ChartData, ChartOptions } from 'chart.js'

// ** Third Party Imports
import { Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

// ** Third Party Styles Import
import 'chart.js/auto'
import { useTranslation } from 'react-i18next'
import { fetchReportAttendance } from 'src/features/store/apps/tools/reports/attendance'
import { fetchReportPeriods } from 'src/features/store/apps/tools/reports/periods'
import { fetchSettings } from 'src/features/store/apps/settings'
import Icon from 'src/shared/components/icon'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import { DateType } from 'src/entities/app/GeneralTypes'
import { fetchReportJournal } from 'src/features/store/apps/tools/reports/journal'
import { fetchReportParents } from 'src/features/store/apps/tools/reports/parents'
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import ReportDetailDialog from 'src/widgets/reports/ReportDetailDialog'
import { useAuth } from 'src/features/hooks/useAuth'
import { fetchReportExams, fetchReportExamsGraduate } from 'src/features/store/apps/tools/reports/exams'
import { fetchReportStudents } from 'src/features/store/apps/tools/reports/students'
import { usePathname, useSearchParams } from 'next/navigation'
import { ParamsContext } from 'src/app/context/ParamsContext'
import { useRouter } from 'next/router'
import dataTableConfig from 'src/app/configs/dataTableConfig'

interface LabelProp {
  cx: number
  cy: number
  percent: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  payload: any
}

const groupingKeys = [
  { report: 'data', bar_all: 'region', pie_all: 'school_code', bar_detail: 'region', pie_detail: 'school_code' },
  { report: 'journal', bar_all: 'region', pie_all: 'school_code', bar_detail: 'school', pie_detail: 'user' },
  { report: 'attendance', bar_all: 'region', pie_all: 'school_code', bar_detail: 'school', pie_detail: 'classroom' },
  { report: 'period', bar_all: 'region', pie_all: 'school_code', bar_detail: 'school', pie_detail: 'user' },
  { report: 'exams', bar_all: 'region', pie_all: 'school_code', bar_detail: 'school', pie_detail: 'school_code' },
  {
    report: 'exams_graduate',
    bar_all: 'region',
    pie_all: 'school_code',
    bar_detail: 'school',
    pie_detail: 'school_code'
  },
  { report: 'students', bar_all: 'region', pie_all: 'school_code', bar_detail: 'school', pie_detail: 'school_code' },
  { report: 'parents', bar_all: 'region', pie_all: 'school_code', bar_detail: 'school', pie_detail: 'classroom' }
]

const RADIAN = Math.PI / 180
const renderCustomizedLabel = (props: LabelProp) => {
  // ** Props
  const { cx, cy, midAngle, innerRadius, outerRadius, payload } = props
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill='#fff' textAnchor='middle' dominantBaseline='central'>
      {payload.name}
    </text>
  )
}

type ReportTableType = {
  headers: string[]
  rows: ReportRowType[]
  totals: ReportTotalType[]
  has_detail: boolean
  table_data: any
}

type ChartBarDataType = {
  labels: string[]
  values: number[]
}

type ChartPieDataType = {
  name: string
  values: string
  total: number
  color: string
}

interface PickerProps {
  label?: string
  end: Date | number
  start: Date | number
}

interface ActiveDetailType {
  school: string
  school_id: string | null
  user_id: string | null
}

const CustomInput = forwardRef((props: PickerProps, ref) => {
  const startDate = props.start !== null ? format(props.start, 'dd.MM.yyyy') : ''
  const endDate = props.end !== null ? ` - ${props.end && format(props.end, 'dd.MM.yyyy')}` : null

  const value = `${startDate}${endDate !== null ? endDate : ''}`

  return (
    <TextField size='small' inputRef={ref} label={props.label || ''} sx={{ width: 250 }} {...props} value={value} />
  )
})

const CustomTooltip = () => {
  const theme = useTheme()

  return (
    <Card sx={{ border: `1px solid ${theme.palette.divider}`, p: 3 }}>
      <Typography>
        <Translations text='ClickForDetails' />
      </Typography>
    </Card>
  )
}

const GroupedTableBody = (props: any) => {
  const { data } = props
  const groupedData = data.reduce((acc: any, row: any) => {
    const key = row.key1
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(row)

    return acc
  }, {})

  const keysObject = data.reduce(
    (maxObj: any, currentObj: any) =>
      Object.keys(currentObj).length > Object.keys(maxObj).length ? currentObj : maxObj,
    {}
  )
  const allKeys = data ? Object.keys(keysObject) : []
  const renderRow = (row: any, index: number, groupSize: number) => (
    <TableRow hover key={index}>
      {index === 0 && <TableCell rowSpan={groupSize}>{row.key1}</TableCell>}
      {allKeys
        .filter(key => key !== 'key1' && key !== 'school_id')
        .map(key => {
          if (row[key] && row[key].length > 1) {
            let style = {}
            const valParts = row[key]?.split('#')
            if (valParts && valParts.length === 2) {
              style = {
                color: (theme: any) => `${theme.palette.common.white} !important`,
                backgroundColor: `#${valParts[1]}`
              }
            }

            return (
              <TableCell key={key} sx={style}>
                {valParts && valParts.length === 2 ? valParts[0] : row[key]}
              </TableCell>
            )
          } else {
            return <TableCell key={key}>{row[key]}</TableCell>
          }
        })}
    </TableRow>
  )

  return (
    <>
      {Object.values(groupedData).map((group: any) => {
        return group.map((row: any, index: number) => renderRow(row, index, group.length))
      })}
    </>
  )
}

const validateTypeParam = (type: string | null) => {
  if (type && type !== '') {
    if (
      type === 'data' ||
      type === 'period' ||
      type === 'journal' ||
      type === 'attendance' ||
      type === 'parents' ||
      type === 'exams' ||
      type === 'exams_graduate' ||
      type === 'students'
    ) {
      return type
    } else {
      return ''
    }
  } else {
    return ''
  }
}

const validateQuarterParam = (quarter: string | null) => {
  if (quarter && quarter !== '') {
    if (quarter === '1' || quarter === '2' || quarter === '3' || quarter === '4') {
      return quarter
    } else {
      return ''
    }
  } else {
    return ''
  }
}

const Reports = () => {
  const [groupPercent, setGroupPercent] = useState<string | null>(null)
  const [quarter, setQuarter] = useState<string>('')
  const [date, setDate] = useState<(string | null)[]>([
    format(new Date(), 'yyyy-MM-dd'),
    format(new Date(), 'yyyy-MM-dd')
  ])
  const [startDate, setStartDate] = useState<DateType | null>(new Date())
  const [endDate, setEndDate] = useState<DateType | null>(new Date())
  const [isLoading, setIsLoading] = useState<boolean | undefined>(undefined)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [loadingQueries, setLoadingQueries] = useState<boolean | null>(null)
  const [currentReport, setCurrentReport] = useState<string>('')
  const [activeDetail, setActiveDetail] = useState<ActiveDetailType | null>(null)
  const [chartBarData, setChartBarData] = useState<ChartBarDataType>({
    labels: [],
    values: []
  })
  const [chartPieData, setChartPieData] = useState<ChartPieDataType[]>([])
  const [activeReportData, setActiveReportData] = useState<ReportTableType | null>(null)
  const [regions, setRegions] = useState<string[] | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [data, setData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])

  // ** Hook
  const theme = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const { current_school } = useAuth()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { reportsParams, setSearchParams } = useContext(ParamsContext)
  const { settings } = useSelector((state: RootState) => state.settings)
  const { reports } = useSelector((state: RootState) => state.reports)
  const { report_journal } = useSelector((state: RootState) => state.reportJournal)
  const { report_parents } = useSelector((state: RootState) => state.reportParents)
  const { report_attendance } = useSelector((state: RootState) => state.reportAttendance)
  const { report_periods } = useSelector((state: RootState) => state.reportPeriods)
  const { report_exams, report_exams_graduate } = useSelector((state: RootState) => state.reportExams)
  const { report_students } = useSelector((state: RootState) => state.reportStudents)

  useEffect(() => {
    setLoadingQueries(true)
    if (router.isReady) {
      const type = validateTypeParam(searchParams.get('type'))
      const period_number = validateQuarterParam(searchParams.get('period_number'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      if (type) {
        paramsToSet.type = type
        setCurrentReport(type)
      } else if (reportsParams.type) {
        paramsToRedirect.type = reportsParams.type
        setCurrentReport(validateTypeParam(reportsParams.type as string))
      }

      if (period_number) {
        paramsToSet.period_number = period_number
        setQuarter(period_number)
      } else if (reportsParams.period_number) {
        paramsToRedirect.period_number = reportsParams.period_number
        setQuarter(validateQuarterParam(reportsParams.period_number as string))
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('reportsParams', paramsToSet)
      }
      if (Object.keys(paramsToRedirect).length > 0) {
        const params = new URLSearchParams(paramsToRedirect)
        for (const [key, value] of Object.entries(paramsToRedirect)) {
          if (Array.isArray(value)) {
            params.delete(key)
            value.forEach(v => params.append(key, v))
          }
        }
        router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
      }
      setLoadingQueries(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  useEffect(() => {
    if (!loadingQueries) {
      if (currentReport === 'data') {
        dispatch(fetchReports())
      }
      if (currentReport === 'period') {
        dispatch(fetchReportPeriods({ period_number: quarter as string }))
      }
      if (currentReport === 'journal') {
        const params: any = {}
        if (quarter) {
          params.period_number = quarter as string
        } else {
          if (date[0] !== null) {
            params.start_date = date[0]
          }
          if (date[1] !== null) {
            params.end_date = date[1]
          }
        }
        dispatch(fetchReportJournal(params))
      }
      if (currentReport === 'attendance') {
        const params: any = {}
        if (date[0] !== null) {
          params.start_date = date[0]
        }
        if (date[1] !== null) {
          params.end_date = date[1]
        }
        dispatch(fetchReportAttendance(params))
      }
      if (currentReport === 'parents') {
        dispatch(fetchReportParents())
      }
      if (currentReport === 'exams') {
        dispatch(fetchReportExams())
      }
      if (currentReport === 'exams_graduate') {
        dispatch(fetchReportExamsGraduate())
      }
      if (currentReport === 'students') {
        dispatch(fetchReportStudents())
      }
    }
  }, [currentReport, date, dispatch, loadingQueries, quarter])

  useEffect(() => {
    dispatch(fetchSettings({}))
  }, [dispatch])

  useEffect(() => {
    if (
      !settings.loading &&
      settings.status === 'success' &&
      settings.data.general.default_period.current_number &&
      quarter === null
    ) {
      setQuarter(settings.data.general.default_period.current_number.toString())
    }
  }, [quarter, settings])

  const generateChartData = (data: any) => {
    const barResult: any = {}
    const groupKey = groupingKeys.find((group: any) => group.report === currentReport) as any
    const barKey: keyof ReportRowType = current_school === null ? groupKey.bar_all : groupKey.bar_detail
    const pieKey: keyof ReportRowType = current_school === null ? groupKey.pie_all : groupKey.pie_detail

    const barMap = data.rows.reduce((groups: any, item: any) => {
      if (!groups[item[barKey]]) {
        groups[item[barKey]] = []
      }
      groups[item[barKey]].push(item)

      return groups
    }, {})

    for (const item in barMap) {
      const percentages = barMap[item].map((item: any) => item.percent)
      const averagePercent = percentages.reduce((sum: any, percent: any) => sum + percent, 0) / percentages.length
      barResult[item] = Math.round(averagePercent)
    }

    setChartBarData({
      labels: Object.keys(barResult),
      values: Object.values(barResult)
    })

    let pieObj: any = {}
    if (currentReport === 'attendance') {
      pieObj = {
        '91-100%': [] as string[],
        '81-90%': [] as string[],
        '0-80%': [] as string[]
      }
    } else {
      pieObj = {
        '91-100%': [] as string[],
        '51-90%': [] as string[],
        '21-50%': [] as string[],
        '0-20%': [] as string[]
      }
    }

    for (const item of data.rows as ReportRowType[]) {
      const percentage = item.percent as number
      if (currentReport === 'attendance') {
        if (0 <= percentage && percentage <= 80) {
          pieObj['0-80%'].push(item[pieKey])
        } else if (81 <= percentage && percentage <= 90) {
          pieObj['81-90%'].push(item[pieKey])
        } else {
          pieObj['91-100%'].push(item[pieKey])
        }
      } else {
        if (0 <= percentage && percentage <= 20) {
          pieObj['0-20%'].push(item[pieKey])
        } else if (21 <= percentage && percentage <= 50) {
          pieObj['21-50%'].push(item[pieKey])
        } else if (51 <= percentage && percentage <= 90) {
          pieObj['51-90%'].push(item[pieKey])
        } else {
          pieObj['91-100%'].push(item[pieKey])
        }
      }
    }

    const colors = ['#007000', '#ddaa00', '#e37300', '#d2222d']

    const pieChartData = Object.entries(pieObj)
      .map(([key, values]: [any, any]) => ({
        name: key,
        values: values.join(', '),
        total: values.length
      }))
      .map((item, index) => ({
        ...item,
        color: colors[Math.min(index, colors.length - 1)]
      }))

    setChartPieData(pieChartData)
  }

  const generateTableData = (data: any) => {
    const headers: any = {}
    const dataHeaders = data.headers
    dataHeaders
      .filter((element: string, index: number) => dataHeaders.indexOf(element) === index)
      .map((header: string, index: number) => {
        if (currentReport !== 'students' && currentReport !== 'exams' && currentReport !== 'exams_graduate') {
          headers['region'] = 'Etrap'
        }
        headers[`key${index + 1}`] = header
        headers['school_id'] = 'school_id'
        headers['user_id'] = 'user_id'
      })
    setHeaders(headers)

    const arr: any = []
    let hasUser = false
    data.rows.map((row: any) => {
      let obj: any = {}
      if (row.user_id) {
        hasUser = true
      }
      row.values.map((v: string, i: number) => {
        if (
          row.user_id === null &&
          currentReport !== 'students' &&
          currentReport !== 'exams' &&
          currentReport !== 'exams_graduate'
        ) {
          current_school === null ? (obj[`region`] = row.region) : null
        }
        obj[`key${i + 1}`] = /^\d+$/.test(v) ? parseInt(v) : v
        obj['school_id'] = row.school_id
        obj['user_id'] = row.user_id
      })
      arr.push(obj)
      obj = {}
    })
    if (hasUser === false) {
      const uniqueRegions = [...new Set(data.rows.map((item: any) => item.region))]
      setRegions(uniqueRegions as string[])
    }
    setFilteredData(arr)
    setData(arr)
  }

  const getDataByType = (s: string) => {
    switch (s) {
      case 'data':
        return reports.data
        break
      case 'journal':
        return report_journal.data
        break
      case 'period':
        return report_periods.data
        break
      case 'attendance':
        return report_attendance.data
        break
      case 'parents':
        return report_parents.data
        break
      case 'exams':
        return report_exams.data
        break
      case 'exams_graduate':
        return report_exams_graduate.data
        break
      case 'students':
        return report_students.data
        break
      default:
        return null
        break
    }
  }

  useEffect(() => {
    const currentData = getDataByType(currentReport)
    if (isLoading === false && activeReportData) {
      generateChartData(currentData)
      generateTableData(currentData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentReport, isLoading])

  const getReportData = (loading: boolean, data: any) => {
    if (!loading && data.rows) {
      const reportData: ReportTableType = {
        totals: data.totals,
        headers: data.headers,
        rows: data.rows,
        has_detail: data.has_detail,
        table_data: data.rows.reduce((groups: any, item: any) => {
          if (!groups[item.region]) {
            groups[item.region] = []
          }
          groups[item.region].push(item)

          return groups
        }, {})
      }
      setActiveReportData(reportData)
    }
  }

  useEffect(() => {
    switch (currentReport) {
      case 'data':
        getReportData(reports.loading, reports.data)
        break
      case 'period':
        getReportData(report_periods.loading, report_periods.data)
        break
      case 'journal':
        getReportData(report_journal.loading, report_journal.data)
        break
      case 'attendance':
        getReportData(report_attendance.loading, report_attendance.data)
        break
      case 'parents':
        getReportData(report_parents.loading, report_parents.data)
        break
      case 'exams':
        getReportData(report_exams.loading, report_exams.data)
        break
      case 'exams_graduate':
        getReportData(report_exams_graduate.loading, report_exams_graduate.data)
        break
      case 'students':
        getReportData(report_students.loading, report_students.data)
        break
      default:
        setActiveReportData(null)
        break
    }
  }, [
    reports,
    report_journal,
    report_parents,
    report_periods,
    report_attendance,
    report_students,
    report_exams,
    report_exams_graduate,
    currentReport
  ])

  useEffect(() => {
    switch (currentReport) {
      case 'data':
        setIsLoading(reports.loading)
        break
      case 'journal':
        setIsLoading(report_journal.loading)
        break
      case 'period':
        setIsLoading(report_periods.loading)
        break
      case 'attendance':
        setIsLoading(report_attendance.loading)
        break
      case 'parents':
        setIsLoading(report_parents.loading)
        break
      case 'exams':
        setIsLoading(report_exams.loading)
        break
      case 'exams_graduate':
        setIsLoading(report_exams_graduate.loading)
        break
      case 'students':
        setIsLoading(report_students.loading)
        break
      default:
        setIsLoading(false)
        break
    }
  }, [
    currentReport,
    report_exams.loading,
    report_journal.loading,
    report_parents.loading,
    report_periods.loading,
    report_students.loading,
    report_attendance.loading,
    report_exams_graduate.loading,
    reports.loading
  ])

  const handleReportChange = (val: string) => {
    setActiveReportData(null)
    setGroupPercent(null)
    setRegions(null)
    setSelectedRegion('all')
    setCurrentReport(val)
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('type', val)
    } else {
      params.delete('type')
      const contextParams = delete reportsParams.type
      setSearchParams('reportsParams', contextParams)
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handlePeriodChange = (e: SelectChangeEvent<string>) => {
    setGroupPercent(null)
    const val = e.target.value
    const thisPeriod = settings.data.general.default_period.value[parseInt(val) - 1]
    if (thisPeriod) {
      setStartDate(new Date(thisPeriod[0]))
      setEndDate(new Date(thisPeriod[1]))
      setDate(thisPeriod.map((date: string | null) => date && format(new Date(date), 'yyyy-MM-dd')))
    }

    setQuarter(val)
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('period_number', val)
    } else {
      params.delete('period_number')
      const contextParams = delete reportsParams.period_number
      setSearchParams('reportsParams', contextParams)
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleChangeRegion = (e: SelectChangeEvent<string>) => {
    e?.preventDefault()
    setGroupPercent(null)
    setSelectedRegion(e.target.value)

    if (e.target.value === 'all') {
      setFilteredData(data)
    } else {
      const filteredData = data.filter((item: any) => item.region === e.target.value)
      setFilteredData(filteredData)
    }
  }

  const handleOpenDialog = (school: string, school_id: string | null, user_id: string | null) => {
    setActiveDetail({ school: school, school_id: school_id, user_id: user_id })
    setDialogOpen(true)
  }

  const handleClose = () => {
    setDialogOpen(false)
  }

  const getCurrentReportTitle = (name: string) => {
    switch (name) {
      case 'data':
        return t('ReportData')
        break
      case 'journal':
        return t('ReportJournal')
        break
      case 'period':
        return t('ReportPeriod')
        break
      case 'attendance':
        return t('ReportAttendance')
        break
      case 'parents':
        return t('ReportParents')
        break
      case 'exams':
        return t('ReportExams')
        break
      case 'exams_graduate':
        return t('ReportExamsGraduate')
        break
      case 'students':
        return t('ReportStudents')
        break
      default:
        return null
        break
    }
  }

  const convertDataToExcel = (data: any | null) => {
    if (!data) return

    const transformedData = data.rows.map((row: any) => {
      const obj: any = {}
      data.headers.forEach((header: any, index: number) => {
        if (row.values && row.values[index]) {
          obj[header] = row.values[index]
        } else {
          obj[header] = ''
        }
      })

      return obj
    })

    const transformedTotals = data.totals.map((row: any) => {
      const obj: any = {}
      obj['Ady'] = row.title
      obj['Bahasy'] = row.value

      return obj
    })

    exportReportToExcel(
      `${getCurrentReportTitle(currentReport)} ${format(new Date(), 'dd.MM.yyyy')}.xlsx`,
      transformedData,
      transformedTotals
    )
  }

  const handleClickPie = (type: string) => {
    const reg = type.match(/(\d+)-(\d+)/)
    const first = reg && reg[1]
    const second = reg && reg[2]
    const currentData = JSON.parse(JSON.stringify(getDataByType(currentReport)))
    currentData.rows = currentData.rows.filter((row: any) => {
      if (first && second) {
        if (first <= row.percent && row.percent <= second) {
          return row
        }
      }
    })
    if (isLoading === false && activeReportData) {
      generateTableData(currentData)
    }
    setGroupPercent(type)
  }

  const yellow = theme.palette.success.main
  const labelColor = theme.palette.text.disabled
  const borderColor = theme.palette.divider

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    scales: {
      x: {
        grid: {
          color: borderColor
        },
        ticks: { color: labelColor }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: borderColor
        },
        ticks: {
          stepSize: 20,
          color: labelColor
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  }

  const barChartData: ChartData<'bar'> = {
    labels: chartBarData.labels,
    datasets: [
      {
        maxBarThickness: 20,
        backgroundColor: yellow,
        borderColor: 'transparent',
        borderRadius: { topRight: 15, topLeft: 15 },
        data: chartBarData.values
      }
    ]
  }

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () =>
      data.length
        ? Object.keys(data[0]).map(columnId => {
            const col: any = {
              id: columnId,
              accessorKey: columnId,
              header: headers[columnId as any] ?? '',
              Header: ({ column }: { column: any }) => (
                <Typography variant='body2' sx={{ whiteSpace: 'normal', textWrap: 'wrap' }}>
                  {column.columnDef.header}
                </Typography>
              ),
              Cell: ({ cell, row }: { cell: any; row: any }) => {
                if (headers[columnId as any] && headers[columnId as any].includes('%')) {
                  return (
                    <Box display={'flex'} alignItems={'center'}>
                      <LinearProgress
                        color='primary'
                        value={cell.getValue()}
                        variant='determinate'
                        sx={{
                          height: 8,
                          width: 160,
                          borderRadius: 8
                        }}
                      />
                      <Typography ml={3}>{`${cell.getValue()}%`}</Typography>
                    </Box>
                  )
                } else if (columnId === 'key1') {
                  return (
                    <Box display='flex' flexDirection='column'>
                      <Typography>{cell.getValue()}</Typography>
                      <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                        {row.original.region}
                      </Typography>
                    </Box>
                  )
                } else {
                  return <Typography>{cell.getValue()}</Typography>
                }
              }
            }
            if (headers[columnId as any] && headers[columnId as any].includes('%')) {
              col['minSize'] = 230
            }
            if (
              columnId !== 'key1' &&
              currentReport !== 'students' &&
              currentReport !== 'exams' &&
              currentReport !== 'exams_graduate'
            ) {
              if (headers[columnId as any] && headers[columnId as any].includes('%')) {
                col['aggregationFn'] = 'mean'
                col['AggregatedCell'] = ({ cell }: { cell: any }) => {
                  return (
                    <Box display={'flex'} alignItems={'center'}>
                      <LinearProgress
                        color='primary'
                        value={Math.round(cell.getValue())}
                        variant='determinate'
                        sx={{
                          height: 8,
                          width: 160,
                          borderRadius: 8
                        }}
                      />
                      <Typography ml={3}>{`${Math.round(cell.getValue())}%`}</Typography>
                    </Box>
                  )
                }
              } else {
                col['aggregationFn'] = 'sum'
                col['AggregatedCell'] = ({ cell }: { cell: any }) => cell.getValue()
              }
            }

            return col
          })
        : [],
    [data, headers, currentReport]
  )

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableSorting: true,
    enableGrouping: true,
    enableRowNumbers: true,
    enableRowActions: activeReportData?.has_detail === true ? true : false,
    enableRowVirtualization: true,
    rowVirtualizerOptions: { overscan: 3 },
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableColumnPinning: true,
    enableHiding: false,
    enablePagination: false,
    enableRowSelection: false,
    enableGlobalFilter: false,
    enableDensityToggle: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    renderTopToolbar: false,
    renderBottomToolbar: false,
    muiTablePaperProps: { sx: { boxShadow: 'none!important' } },
    muiToolbarAlertBannerChipProps: { color: 'primary' },
    muiTableContainerProps: { sx: { maxHeight: '80vh' } },
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box display='flex' alignItems='center' justifyContent='center'>
        <IconButton
          size='small'
          onClick={() => {
            handleOpenDialog(row.original.key1, row.original.school_id, row.original.user_id)
          }}
          sx={{ color: 'text.secondary' }}
        >
          <Icon icon='tabler:eye' fontSize={20} />
        </IconButton>
      </Box>
    ),
    columns,
    data: filteredData,
    initialState: {
      density: 'compact',
      expanded: true
    },
    state: {
      columnPinning: { left: ['mrt-row-numbers', 'region', 'key1'] },
      grouping:
        currentReport === 'students' || currentReport === 'exams' || currentReport === 'exams_graduate' ? ['key1'] : [],
      columnVisibility: { school_id: false, region: false, user_id: false }
    }
  })

  if (reports.error) {
    return <Error error={reports.error} />
  }

  if (report_parents.error) {
    return <Error error={report_parents.error} />
  }

  if (report_periods.error) {
    return <Error error={report_periods.error} />
  }

  if (report_attendance.error) {
    return <Error error={report_attendance.error} />
  }

  if (report_journal.error) {
    return <Error error={report_journal.error} />
  }

  if (report_exams.error) {
    return <Error error={report_exams.error} />
  }

  if (report_exams_graduate.error) {
    return <Error error={report_exams_graduate.error} />
  }

  if (report_students.error) {
    return <Error error={report_students.error} />
  }

  return (
    <>
      {dialogOpen && (
        <ReportDetailDialog
          quarter={quarter}
          date={date}
          currentReport={currentReport}
          activeDetail={activeDetail}
          dialogOpen={dialogOpen}
          handleClose={handleClose}
          handleOpenDialog={handleOpenDialog}
        />
      )}
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('Reports')}
              action={
                <Box display={'flex'} gap={3}>
                  {(currentReport === 'attendance' || currentReport === 'journal') && (
                    <DatePickerWrapper>
                      <DatePicker
                        id='date'
                        locale='tm'
                        selectsRange
                        selected={startDate}
                        endDate={endDate}
                        startDate={startDate}
                        dateFormat='dd.MM.yyyy'
                        showYearDropdown
                        showMonthDropdown
                        autoComplete='off'
                        placeholderText={t('SelectDate') as string}
                        customInput={
                          <CustomInput
                            label={t('Date') as string}
                            start={startDate as Date | number}
                            end={endDate as Date | number}
                          />
                        }
                        calendarStartDay={1}
                        shouldCloseOnSelect={false}
                        onChange={(dates: any) => {
                          const [start, end] = dates
                          setGroupPercent(null)
                          setQuarter('')
                          setStartDate(start)
                          setEndDate(end)
                          setDate(dates.map((date: string | null) => date && format(new Date(date), 'yyyy-MM-dd')))
                        }}
                      />
                    </DatePickerWrapper>
                  )}
                  {(currentReport === 'period' || currentReport === 'journal') && (
                    <Grid item xs={12} md={12} lg={6}>
                      <FormControl fullWidth size='small'>
                        <InputLabel id='quarter-filter-label'>
                          <Translations text='Quarter' />
                        </InputLabel>
                        <Select
                          label={t('Quarter')}
                          value={quarter}
                          defaultValue={quarter}
                          onChange={handlePeriodChange}
                          id='quarter-filter'
                          labelId='quarter-filter-label'
                        >
                          <MenuItem value='1'>
                            I <Translations text='Quarter' />
                          </MenuItem>
                          <MenuItem value='2'>
                            II <Translations text='Quarter' />
                          </MenuItem>
                          <MenuItem value='3'>
                            III <Translations text='Quarter' />
                          </MenuItem>
                          <MenuItem value='4'>
                            IV <Translations text='Quarter' />
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {currentReport && (
                    <Button
                      color='success'
                      variant='contained'
                      onClick={() => {
                        !isLoading && convertDataToExcel(getDataByType(currentReport))
                      }}
                      sx={{ px: 6, minWidth: 140 }}
                      startIcon={<Icon icon='tabler:download' fontSize={20} />}
                    >
                      <Translations text='Export' />
                    </Button>
                  )}
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={12}>
                  <ButtonGroup fullWidth>
                    <Button
                      variant={currentReport === 'data' ? 'contained' : 'outlined'}
                      onClick={() => handleReportChange('data')}
                    >
                      1. <Translations text='ReportData' />
                    </Button>
                    <Button
                      variant={currentReport === 'journal' ? 'contained' : 'outlined'}
                      onClick={() => handleReportChange('journal')}
                    >
                      2. <Translations text='ReportJournal' />
                    </Button>
                    <Button
                      variant={currentReport === 'attendance' ? 'contained' : 'outlined'}
                      onClick={() => handleReportChange('attendance')}
                    >
                      3. <Translations text='ReportAttendance' />
                    </Button>
                    <Button
                      variant={currentReport === 'period' ? 'contained' : 'outlined'}
                      onClick={() => handleReportChange('period')}
                    >
                      4. <Translations text='ReportPeriod' />
                    </Button>
                  </ButtonGroup>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <ButtonGroup fullWidth>
                    <Button
                      variant={currentReport === 'parents' ? 'contained' : 'outlined'}
                      onClick={() => handleReportChange('parents')}
                    >
                      5. <Translations text='ReportParents' />
                    </Button>
                    <Button
                      variant={currentReport === 'students' ? 'contained' : 'outlined'}
                      onClick={() => handleReportChange('students')}
                    >
                      6. <Translations text='ReportStudents' />
                    </Button>
                    <Button
                      variant={currentReport === 'exams' ? 'contained' : 'outlined'}
                      onClick={() => handleReportChange('exams')}
                    >
                      7. <Translations text='ReportExams' />
                    </Button>
                    <Button
                      variant={currentReport === 'exams_graduate' ? 'contained' : 'outlined'}
                      onClick={() => handleReportChange('exams_graduate')}
                    >
                      8. <Translations text='ReportExamsGraduate' />
                    </Button>
                  </ButtonGroup>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        {isLoading ? (
          <Box
            sx={{
              width: '100%',
              height: '40vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress />
          </Box>
        ) : activeReportData ? (
          <>
            <Grid item xs={8}>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Card>
                    <CardHeader title={t('BarChartTitle')} />
                    <CardContent>
                      <Bar data={barChartData} height={400} options={options} />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardHeader title={t('PieChartTitle')} />
                    <CardContent>
                      <Box sx={{ height: 400 }}>
                        <ResponsiveContainer>
                          <PieChart height={350} style={{ direction: 'ltr' }}>
                            <Pie
                              data={chartPieData}
                              dataKey='total'
                              minAngle={10}
                              label={renderCustomizedLabel}
                              labelLine={false}
                            >
                              {chartPieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    handleClickPie(entry.name)
                                  }}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {activeReportData ? (
              <Grid item xs={4}>
                <Card sx={{ height: '100%' }}>
                  <TableContainer component={Paper} sx={{ overflowX: 'initial' }}>
                    <Table size='small' aria-label='sticky table'>
                      <TableBody>
                        {activeReportData.totals.map((total: any, index: number) => {
                          const valParts = total.title.split('#')
                          let bg = ''
                          if (valParts && valParts.length === 2) {
                            bg = `#${valParts[1]}`
                          } else {
                            bg = 'transparent'
                          }

                          return (
                            <TableRow
                              key={index}
                              hover
                              sx={{
                                color: (theme: any) => `${theme.palette.common.white} !important`,
                                backgroundColor: bg
                              }}
                            >
                              <TableCell align={'left'}>{valParts[0]}</TableCell>
                              <TableCell align={'left'}>{total.value}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            ) : null}

            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ borderBottom: () => `1px solid ${theme.palette.divider}` }}>
                  <Box display='flex' alignItems='left' justifyContent='end' gap={5}>
                    {groupPercent && (
                      <Button
                        variant='tonal'
                        color='success'
                        endIcon={<Icon icon='tabler:x' fontSize={24} />}
                        onClick={() => {
                          setGroupPercent(null)
                          const currentData = getDataByType(currentReport)
                          generateTableData(currentData)
                        }}
                      >
                        {groupPercent} aralykda toparlanan
                      </Button>
                    )}
                    {regions !== null && (
                      <FormControl size='small' sx={{ minWidth: 200 }}>
                        <InputLabel id='region-filter-label'>
                          <Translations text='Region' />
                        </InputLabel>
                        <Select
                          label={t('Region')}
                          value={selectedRegion}
                          onChange={handleChangeRegion}
                          id='region-filter'
                          labelId='region-filter-label'
                          sx={{ minWidth: 100 }}
                        >
                          <MenuItem value='all'>
                            <Translations text='All' />
                          </MenuItem>
                          {regions &&
                            regions.map((region: string, index: number) => (
                              <MenuItem key={index} value={region}>
                                {region}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                </CardContent>
                {currentReport !== 'exams' && currentReport !== 'exams_graduate' && currentReport !== 'students' ? (
                  <MaterialReactTable table={table} />
                ) : Object.keys(data).length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table
                      size='small'
                      aria-label='spanning table'
                      sx={{
                        minWidth: 700,
                        '& .MuiTableCell-root': {
                          whiteSpace: 'nowrap',
                          borderLeft: theme => `1px solid ${theme.palette.divider}`
                        }
                      }}
                    >
                      <TableHead>
                        <TableRow>
                          {headers &&
                            Object.entries(headers).map(entry => {
                              const key = entry[0]
                              const value = entry[1]
                              if (key !== 'school_id') {
                                return (
                                  <TableCell
                                    key={key}
                                    align='center'
                                    colSpan={
                                      (key !== 'key1' && currentReport === 'exams_graduate') ||
                                      (key !== 'key1' && currentReport === 'exams')
                                        ? 3
                                        : 1
                                    }
                                  >
                                    {value}
                                  </TableCell>
                                )
                              }
                            })}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <GroupedTableBody data={data} />
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : null}
              </Card>
            </Grid>
          </>
        ) : null}
      </Grid>
    </>
  )
}

Reports.acl = {
  action: 'read',
  subject: 'tool_reports'
}

export default Reports
