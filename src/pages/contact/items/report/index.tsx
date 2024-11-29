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
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'
import { forwardRef, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import Translations from 'src/app/layouts/components/Translations'
import { AppDispatch, RootState } from 'src/features/store'
import { getContactItemsReport } from 'src/features/store/apps/contactItems'
import Error from 'src/widgets/general/Error'
import Icon from 'src/shared/components/icon'
import CustomTextField from 'src/shared/components/mui/text-field'
import { fetchUsersLite } from 'src/features/store/apps/user'
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
import { ParamsContext } from 'src/app/context/ParamsContext'

const statusArr = [
  {
    id: 1,
    type: 'waiting',
    display_name: 'ContactStatusWaiting'
  },
  {
    id: 2,
    type: 'todo',
    display_name: 'ContactStatusTodo'
  },
  {
    id: 3,
    type: 'processing',
    display_name: 'ContactStatusProcessing'
  },
  {
    id: 4,
    type: 'done',
    display_name: 'ContactStatusDone'
  },
  {
    id: 5,
    type: 'backlog',
    display_name: 'ContactStatusBacklog'
  },
  {
    id: 6,
    type: 'rejected',
    display_name: 'ContactStatusRejected'
  }
]

interface PickerProps {
  label?: string
  end: Date | number | null
  start: Date | number | null
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
    if (
      status === 'waiting' ||
      status === 'todo' ||
      status === 'processing' ||
      status === 'done' ||
      status === 'backlog' ||
      status === 'rejected'
    ) {
      return status
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

const ContactItemsReport = () => {
  // ** State
  const [data, setData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [sumValues, setSumValues] = useState<any>(null)
  const [isFiltered, setIsFiltered] = useState<boolean>(false)
  const [loadingQueries, setLoadingQueries] = useState<boolean>(true)

  const [date, setDate] = useState<(string | null)[]>([null, null])
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [statusQuery, setStatusQuery] = useState<string>('')

  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // ** Hooks
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { contactItemsReportParams, setSearchParams } = useContext(ParamsContext)
  const { contact_items_report } = useSelector((state: RootState) => state.contactItems)

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
    setLoadingQueries(true)
    if (router.isReady) {
      const searchQuery = validateSearchParam(searchParams.get('search'))
      const status = validateStatusParam(searchParams.get('status'))
      const start_date = validateSearchParam(searchParams.get('start_date'))
      const end_date = validateSearchParam(searchParams.get('end_date'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      const dateToSet: (string | null)[] = [null, null]
      if (start_date) {
        paramsToSet.start_date = start_date
        dateToSet[0] = start_date
      } else if (contactItemsReportParams.start_date) {
        paramsToRedirect.start_date = contactItemsReportParams.start_date
        dateToSet[0] = validateSearchParam(contactItemsReportParams.start_date as string)
      }
      if (end_date) {
        paramsToSet.end_date = end_date
        dateToSet[1] = end_date
      } else if (contactItemsReportParams.end_date) {
        paramsToRedirect.end_date = contactItemsReportParams.end_date
        dateToSet[1] = validateSearchParam(contactItemsReportParams.end_date as string)
      }
      setDate(dateToSet)

      if (status) {
        paramsToSet.status = status
        setStatusQuery(status)
      } else if (contactItemsReportParams.status) {
        paramsToRedirect.status = contactItemsReportParams.status
        setStatusQuery(validateStatusParam(contactItemsReportParams.status as string) || '')
      }

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (contactItemsReportParams.search) {
        paramsToRedirect.search = contactItemsReportParams.search
        setSearchValue(validateSearchParam(contactItemsReportParams.search as string))
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('contactItemsReportParams', paramsToSet)
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
      const urlParams: any = {
        is_list: true
      }
      if (searchValue !== '') {
        urlParams['search'] = searchValue
      }
      if (statusQuery !== '') {
        urlParams['status'] = statusQuery
      }
      if (date[0] !== null) {
        urlParams['start_date'] = date[0]
      }
      if (date[1] !== null) {
        urlParams['end_date'] = date[1]
      }

      const timeoutId = setTimeout(() => {
        dispatch(getContactItemsReport(urlParams))
      }, 400)

      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [dispatch, searchValue, statusQuery, date, loadingQueries])

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
    if (!contact_items_report.loading && contact_items_report.status === 'success' && contact_items_report.data) {
      generateTableData(contact_items_report.data)
    }
  }, [contact_items_report])

  useEffect(() => {
    dispatch(
      fetchUsersLite({
        limit: 5000,
        offset: 0
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (!searchValue && !statusQuery) {
      setIsFiltered(false)
    } else {
      setIsFiltered(true)
    }
  }, [searchValue, statusQuery])

  const clearFilters = () => {
    setSearchValue('')
    setStatusQuery('')
    setDate([null, null])
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    params.delete('status')
    params.delete('start_date')
    params.delete('end_date')
    const contextParams = contactItemsReportParams
    delete contextParams.search
    delete contextParams.status
    delete contextParams.start_date
    delete contextParams.end_date
    setSearchParams('contactItemsReportParams', contextParams)
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleSearchValue = (val: string) => {
    setSearchValue(val)
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('search', val)
    } else {
      params.delete('search')
      const contextParams = delete contactItemsReportParams.search
      setSearchParams('contactItemsReportParams', contextParams)
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
      const contextParams = delete contactItemsReportParams.status
      setSearchParams('contactItemsReportParams', contextParams)
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleDateParam = (start_date: string | null, end_date: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    const contextParams = { ...contactItemsReportParams }
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
    setSearchParams('contactItemsReportParams', contextParams)
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
                      href={`/settings/contact-items?page=0&tab=contact-items&type=${headers[columnId as any]
                        .split('#')[1]
                        .trim()}&school_id=${row.original.school_id}`}
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
    getRowId: row => (row?.school?.id ? row.school.id : ''),
    muiToolbarAlertBannerProps: contact_items_report.error
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    renderBottomToolbarCustomActions: () => (
      <Typography sx={{ color: 'text.secondary' }}>
        <Translations text='Total' /> {contact_items_report.total}.
      </Typography>
    ),
    rowCount: contact_items_report.total,
    state: {
      density: 'compact',
      isLoading: contact_items_report.loading,
      columnVisibility: { school_id: false, region: false, user_id: false }
    }
  })

  if (contact_items_report.error) {
    return <Error error={contact_items_report.error} />
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
              <Grid item xs={12} sm={9} lg={9}>
                <CustomTextField
                  fullWidth
                  value={searchValue}
                  ref={searchInputRef}
                  placeholder={t('ContactItemsSearch') as string}
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
            </Grid>
          </CardContent>

          <Divider sx={{ my: '0 !important' }} />

          <CardContent>
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
          </CardContent>

          <Divider sx={{ my: '0 !important' }} />

          <MaterialReactTable table={table} />
        </Card>
      </Grid>
    </Grid>
  )
}

ContactItemsReport.acl = {
  action: 'read',
  subject: 'admin_contact_items'
}

export default ContactItemsReport
