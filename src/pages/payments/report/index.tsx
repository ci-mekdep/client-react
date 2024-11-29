import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  TextField,
  Typography
} from '@mui/material'
import format from 'date-fns/format'
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'
import { forwardRef, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import Translations from 'src/app/layouts/components/Translations'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchPaymentReport } from 'src/features/store/apps/payments'
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import { fetchUsersLite } from 'src/features/store/apps/user'
import Icon from 'src/shared/components/icon'
import CustomTextField from 'src/shared/components/mui/text-field'
import Error from 'src/widgets/general/Error'
import TableHeader from 'src/widgets/payments/list/TableHeader'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
import { ParamsContext } from 'src/app/context/ParamsContext'

interface PickerProps {
  label?: string
  end: Date | number | null
  start: Date | number | null
}

const statusArr = [
  {
    id: 1,
    type: 'processing',
    display_name: 'ProcessingStatus'
  },
  {
    id: 2,
    type: 'completed',
    display_name: 'CompletedStatus'
  },
  {
    id: 3,
    type: 'failed',
    display_name: 'FailedStatus'
  }
]

const validateIdParam = (id: string | null) => {
  if (id && id !== '') {
    return id
  } else {
    return null
  }
}

const validateSearchParam = (search: string | null) => {
  if (search && search !== '') {
    return search
  } else {
    return null
  }
}

const validateStatusParam = (status: string | null) => {
  if (status && status !== '') {
    if (status === 'processing' || status === 'completed' || status === 'failed') {
      return status
    } else {
      return null
    }
  }
}

const validateBankTypeParam = (type: string | null) => {
  if (type && type !== '') {
    if (type === 'halkbank' || type === 'rysgalbank' || type === 'senagatbank' || type === 'tfeb') {
      return type
    } else {
      return null
    }
  }
}

const validateTariffTypeParam = (type: string | null) => {
  if (type && type !== '') {
    if (type === 'plus' || type === 'trial') {
      return type
    } else {
      return null
    }
  }
}

const CustomInput = forwardRef((props: PickerProps, ref) => {
  const startDate = props.start !== null ? format(props.start, 'dd.MM.yyyy') : ''
  const endDate = props.end !== null ? ` - ${props.end && format(props.end, 'dd.MM.yyyy')}` : null
  const value = `${startDate}${endDate !== null ? endDate : ''}`

  return <TextField size='small' fullWidth inputRef={ref} label={props.label || ''} {...props} value={value} />
})

const PaymentsReport = () => {
  // ** State
  const [data, setData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [sumValues, setSumValues] = useState<any>(null)
  const [isFiltered, setIsFiltered] = useState<boolean>(false)

  const [date, setDate] = useState<(string | null)[]>([null, null])
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [statusQuery, setStatusQuery] = useState<string>('')
  const [bankTypeQuery, setBankTypeQuery] = useState<string>('')
  const [tariffTypeQuery, setTariffTypeQuery] = useState<string>('')
  const [payerQuery, setPayerQuery] = useState<LiteModelType | null>(null)
  const [schoolQuery, setSchoolQuery] = useState<LiteModelType | null>(null)

  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // ** Hooks
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { paymentsReportParams, setSearchParams } = useContext(ParamsContext)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { payment_report } = useSelector((state: RootState) => state.payments)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.which === 191) {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (
      router.isReady &&
      !users_lite_list.loading &&
      users_lite_list.data &&
      !schools_lite_list.loading &&
      schools_lite_list.data
    ) {
      const searchQuery = validateSearchParam(searchParams.get('search'))
      const status = validateStatusParam(searchParams.get('status'))
      const bankType = validateBankTypeParam(searchParams.get('bank_type'))
      const tariffType = validateTariffTypeParam(searchParams.get('tariff_type'))
      const payerId = validateIdParam(searchParams.get('payer_id'))
      const schoolId = validateIdParam(searchParams.get('school_id'))
      const start_date = validateSearchParam(searchParams.get('start_date'))
      const end_date = validateSearchParam(searchParams.get('end_date'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      const dateToSet: (string | null)[] = [null, null]
      if (start_date) {
        paramsToSet.start_date = start_date
        dateToSet[0] = start_date
      } else if (paymentsReportParams.start_date) {
        paramsToRedirect.start_date = paymentsReportParams.start_date
        dateToSet[0] = validateSearchParam(paymentsReportParams.start_date as string)
      }
      if (end_date) {
        paramsToSet.end_date = end_date
        dateToSet[1] = end_date
      } else if (paymentsReportParams.end_date) {
        paramsToRedirect.end_date = paymentsReportParams.end_date
        dateToSet[1] = validateSearchParam(paymentsReportParams.end_date as string)
      }
      setDate(dateToSet)

      if (status) {
        paramsToSet.status = status
        setStatusQuery(status)
      } else if (paymentsReportParams.status) {
        paramsToRedirect.status = paymentsReportParams.status
        setStatusQuery(validateStatusParam(paymentsReportParams.status as string) || '')
      }

      if (bankType) {
        paramsToSet.bank_type = bankType
        setBankTypeQuery(bankType)
      } else if (paymentsReportParams.bank_type) {
        paramsToRedirect.bank_type = paymentsReportParams.bank_type
        setBankTypeQuery(validateBankTypeParam(paymentsReportParams.bank_type as string) || '')
      }

      if (tariffType) {
        paramsToSet.tariff_type = tariffType
        setTariffTypeQuery(tariffType)
      } else if (paymentsReportParams.tariff_type) {
        paramsToRedirect.tariff_type = paymentsReportParams.tariff_type
        setTariffTypeQuery(validateTariffTypeParam(paymentsReportParams.tariff_type as string) || '')
      }

      if (payerId) {
        paramsToSet.payer_id = payerId
        setPayerQuery(users_lite_list.data.find((user: LiteModelType) => payerId === user.key) || null)
      } else if (paymentsReportParams.payer_id) {
        paramsToRedirect.payer_id = paymentsReportParams.payer_id
        setPayerQuery(
          users_lite_list.data.find((user: LiteModelType) => (paymentsReportParams.payer_id as string) === user.key) ||
            null
        )
      }

      if (schoolId) {
        paramsToSet.school_id = schoolId
        setSchoolQuery(schools_lite_list.data.find((school: LiteModelType) => schoolId === school.key) || null)
      } else if (paymentsReportParams.school_id) {
        paramsToRedirect.school_id = paymentsReportParams.school_id
        setSchoolQuery(
          schools_lite_list.data.find(
            (school: LiteModelType) => (paymentsReportParams.school_id as string) === school.key
          ) || null
        )
      }

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (paymentsReportParams.search) {
        paramsToRedirect.search = paymentsReportParams.search
        setSearchValue(validateSearchParam(paymentsReportParams.search as string))
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('paymentsReportParams', paramsToSet)
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, users_lite_list.data, users_lite_list.loading])

  useEffect(() => {
    const urlParams: any = {
      is_list: true
    }
    if (searchValue !== '') {
      urlParams['search'] = searchValue
    }
    if (bankTypeQuery !== '') {
      urlParams['bank_type'] = bankTypeQuery
    }
    if (tariffTypeQuery !== '') {
      urlParams['tariff_type'] = tariffTypeQuery
    }
    if (statusQuery !== '') {
      urlParams['status'] = statusQuery
    }
    if (payerQuery) {
      urlParams['payer_id'] = payerQuery.key
    }
    if (schoolQuery) {
      urlParams['school_id'] = schoolQuery.key
    }
    if (date[0] !== null) {
      urlParams['start_date'] = date[0]
    }
    if (date[1] !== null) {
      urlParams['end_date'] = date[1]
    }

    const timeoutId = setTimeout(() => {
      dispatch(fetchPaymentReport(urlParams))
    }, 400)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [dispatch, searchValue, bankTypeQuery, tariffTypeQuery, statusQuery, payerQuery, schoolQuery, date])

  const generateTableData = (data: any) => {
    const headers: any = {}
    const dataHeaders = data.headers
    dataHeaders
      .filter((element: string, index: number) => dataHeaders.indexOf(element) === index)
      .map((header: string, index: number) => {
        headers[`key${index + 1}`] = header
        headers['school_id'] = 'school_id'
      })
    setHeaders(headers)

    const summaryValues: any = {}
    const arr: any = []
    data.rows.map((row: any) => {
      let obj: any = {}
      row.values.map((v: string, i: number) => {
        obj[`key${i + 1}`] = /^\d+$/.test(v) ? parseInt(v) : v
        obj['school_id'] = row.school_id

        const key = `key${i + 1}`
        if (/^\d+$/.test(v)) {
          if (!summaryValues[key]) {
            summaryValues[key] = 0
          }
          summaryValues[key] += parseInt(v)
        }
      })
      arr.push(obj)
      obj = {}
    })
    setSumValues(summaryValues)
    setData(arr)
  }

  useEffect(() => {
    if (!payment_report.loading && payment_report.status === 'success' && payment_report.data) {
      generateTableData(payment_report.data)
    }
  }, [payment_report])

  useEffect(() => {
    dispatch(
      fetchUsersLite({
        limit: 5000,
        offset: 0
      })
    )
    dispatch(
      fetchSchoolsLite({
        limit: 750,
        offset: 0
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (!searchValue && !bankTypeQuery && !tariffTypeQuery && !statusQuery && !payerQuery && !schoolQuery) {
      setIsFiltered(false)
    } else {
      setIsFiltered(true)
    }
  }, [searchValue, bankTypeQuery, tariffTypeQuery, statusQuery, payerQuery, schoolQuery])

  const clearFilters = () => {
    setSearchValue('')
    setBankTypeQuery('')
    setTariffTypeQuery('')
    setStatusQuery('')
    setPayerQuery(null)
    setSchoolQuery(null)
    setDate([null, null])
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    params.delete('bank_type')
    params.delete('tariff_type')
    params.delete('status')
    params.delete('payer_id')
    params.delete('school_id')
    params.delete('start_date')
    params.delete('end_date')
    const contextParams = paymentsReportParams
    delete contextParams.search
    delete contextParams.bank_type
    delete contextParams.tariff_type
    delete contextParams.status
    delete contextParams.payer_id
    delete contextParams.school_id
    delete contextParams.start_date
    delete contextParams.end_date
    setSearchParams('paymentsReportParams', contextParams)
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleSearchValue = (val: string) => {
    setSearchValue(val)
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('search', val)
    } else {
      params.delete('search')
      const contextParams = delete paymentsReportParams.search
      setSearchParams('paymentsReportParams', contextParams)
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleBankTypeFilter = (val: string | null) => {
    if (val) {
      setBankTypeQuery(val)
    } else setBankTypeQuery('')
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('bank_type', val)
    } else {
      params.delete('bank_type')
      const contextParams = delete paymentsReportParams.bank_type
      setSearchParams('paymentsReportParams', contextParams)
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleTariffTypeFilter = (val: string | null) => {
    if (val) {
      setTariffTypeQuery(val)
    } else setTariffTypeQuery('')
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('tariff_type', val)
    } else {
      params.delete('tariff_type')
      const contextParams = delete paymentsReportParams.tariff_type
      setSearchParams('paymentsReportParams', contextParams)
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleFilterStatus = (val: string | null) => {
    if (val) {
      setStatusQuery(val)
    } else setStatusQuery('')
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('status', val)
    } else {
      params.delete('status')
      const contextParams = delete paymentsReportParams.status
      setSearchParams('paymentsReportParams', contextParams)
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleFilterPayer = (val: LiteModelType | null) => {
    setPayerQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('payer_id')

    const contextParams = delete paymentsReportParams.payer_id
    setSearchParams('paymentsReportParams', contextParams)

    if (val) {
      params.set('payer_id', val.key.toString())
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleFilterSchool = (val: LiteModelType | null) => {
    setSchoolQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('school_id')

    const contextParams = delete paymentsReportParams.school_id
    setSearchParams('paymentsReportParams', contextParams)

    if (val) {
      params.set('school_id', val.key.toString())
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleDateParam = (start_date: string | null, end_date: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    const contextParams = { ...paymentsReportParams }
    if (start_date) {
      params.set('start_date', format(new Date(start_date), 'yyyy-MM-dd'))
    } else {
      params.delete('start_date')
      delete contextParams.start_date
    }
    if (end_date) {
      params.set('end_date', format(new Date(end_date), 'yyyy-MM-dd'))
    } else {
      params.delete('end_date')
      delete contextParams.end_date
    }
    setSearchParams('paymentsReportParams', contextParams)
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
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
                  {column.columnDef.header.includes('#')
                    ? column.columnDef.header.split('#')[0].trim()
                    : column.columnDef.header}
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
                } else if (
                  headers[columnId as any] &&
                  headers[columnId as any].includes('#') &&
                  headers[columnId as any].split('#')[1].trim()
                ) {
                  return (
                    <Typography
                      component={Link}
                      href={`/payments?page=0&bank_type=${headers[columnId as any].split('#')[1].trim()}&school_id=${
                        row.original.school_id
                      }`}
                      color={'primary.main'}
                      sx={{ fontWeight: '600', textDecoration: 'none' }}
                    >
                      {cell.getValue()}
                    </Typography>
                  )
                } else {
                  return <Typography>{cell.getValue()}</Typography>
                }
              },
              Footer: () => {
                if (columnId === 'key2') {
                  return (
                    <Typography>
                      <Translations text='Total' />:
                    </Typography>
                  )
                } else {
                  return <Typography>{sumValues[columnId]}</Typography>
                }
              }
            }
            if (headers[columnId as any] && headers[columnId as any].includes('%')) {
              col['minSize'] = 230
            }

            return col
          })
        : [],
    [data, headers, sumValues]
  )

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableSorting: true,
    enableRowNumbers: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableRowVirtualization: true,
    rowVirtualizerOptions: { overscan: 3 },
    enableHiding: false,
    enableGrouping: false,
    enablePagination: false,
    enableRowActions: false,
    enableRowSelection: false,
    enableGlobalFilter: false,
    enableDensityToggle: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    renderTopToolbar: false,
    renderBottomToolbar: false,
    muiTablePaperProps: { sx: { boxShadow: 'none!important' } },
    muiBottomToolbarProps: { sx: { paddingLeft: 4 } },
    muiTableContainerProps: { sx: { maxHeight: '80vh', border: 'none' } },
    columns,
    data,
    getRowId: row => (row?.school?.id ? row?.school?.id.toString() : ''),
    muiToolbarAlertBannerProps: payment_report.error
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    renderBottomToolbarCustomActions: () => (
      <Typography sx={{ color: 'text.secondary' }}>
        <Translations text='Total' /> {payment_report.total}.
      </Typography>
    ),
    rowCount: payment_report.total,
    state: {
      density: 'compact',
      isLoading: payment_report.loading,
      columnVisibility: {}
    }
  })

  if (payment_report.error) {
    return <Error error={payment_report.error} />
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={t('ReportBySchool')}
            action={
              isFiltered && (
                <Button
                  fullWidth
                  color='error'
                  variant='tonal'
                  sx={{ minWidth: 190 }}
                  startIcon={<Icon icon='tabler:reload' />}
                  onClick={() => {
                    clearFilters()
                  }}
                >
                  <Translations text='ClearFilters' />
                </Button>
              )
            }
          />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={12} md={4} lg={4}>
                <CustomTextField
                  fullWidth
                  value={searchValue}
                  ref={searchInputRef}
                  placeholder={t('PaymentsSearch') as string}
                  onChange={e => {
                    handleSearchValue(e.target.value)
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Icon fontSize='1.25rem' icon='tabler:search' />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={3} lg={3}>
                <DatePickerWrapper>
                  <DatePicker
                    id='date'
                    locale='tm'
                    selectsRange
                    autoComplete='off'
                    selected={date[0] ? new Date(date[0]) : null}
                    startDate={date[0] ? new Date(date[0]) : null}
                    endDate={date[1] ? new Date(date[1]) : null}
                    dateFormat='dd.MM.yyyy'
                    showYearDropdown
                    showMonthDropdown
                    placeholderText={t('SelectDate') as string}
                    customInput={
                      <CustomInput
                        label={t('Date') as string}
                        start={date[0] ? new Date(date[0]) : null}
                        end={date[1] ? new Date(date[1]) : null}
                      />
                    }
                    calendarStartDay={1}
                    shouldCloseOnSelect={false}
                    onChange={(dates: any) => {
                      const [start, end] = dates
                      setDate(dates.map((date: string | null) => date && format(new Date(date), 'yyyy-MM-dd')))
                      handleDateParam(start, end)
                    }}
                  />
                </DatePickerWrapper>
              </Grid>
              <Grid item xs={12} sm={12} md={5} lg={5}>
                <ButtonGroup variant='outlined' fullWidth>
                  {statusArr.map((row, index) => (
                    <Button
                      key={index}
                      onClick={() => {
                        if (statusQuery === row.type) {
                          handleFilterStatus('')
                        } else {
                          handleFilterStatus(row.type)
                        }
                      }}
                      variant={statusQuery === row.type ? 'contained' : 'outlined'}
                    >
                      <Translations text={row.display_name} />
                    </Button>
                  ))}
                </ButtonGroup>
              </Grid>
            </Grid>
          </CardContent>

          <Divider sx={{ my: '0 !important' }} />

          <TableHeader
            hasBankTypeFilter={false}
            bankType={bankTypeQuery}
            tariffType={tariffTypeQuery}
            payer={payerQuery}
            school={schoolQuery}
            handleBankTypeFilter={handleBankTypeFilter}
            handleTariffTypeFilter={handleTariffTypeFilter}
            handleFilterPayer={handleFilterPayer}
            handleFilterSchool={handleFilterSchool}
          />
          <MaterialReactTable table={table} />
        </Card>
      </Grid>
    </Grid>
  )
}

PaymentsReport.acl = {
  action: 'read',
  subject: 'admin_payments'
}

export default PaymentsReport
