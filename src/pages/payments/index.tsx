// ** React Imports
import { useState, useEffect, useContext, useMemo, useRef, forwardRef } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { ButtonGroup, Divider, InputAdornment, TextField } from '@mui/material'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Third Party Imports

// ** Types Imports
import { RootState, AppDispatch } from 'src/features/store'

// ** Custom Components Imports
import CustomTextField from 'src/shared/components/mui/text-field'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import Error from 'src/widgets/general/Error'
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
import { ParamsContext } from 'src/app/context/ParamsContext'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import TableHeader from 'src/widgets/payments/list/TableHeader'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { fetchUsersLite } from 'src/features/store/apps/user'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_RowSelectionState,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  useMaterialReactTable
} from 'material-react-table'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import { PaymentType } from 'src/entities/app/PaymentType'
import { fetchPayments } from 'src/features/store/apps/payments'
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import format from 'date-fns/format'
import PaymentTotals from 'src/widgets/payments/list/PaymentTotals'
import { renderBankType } from 'src/features/utils/ui/renderBankType'
import { renderTariffType } from 'src/features/utils/ui/renderTariffType'
import { renderPaymentStatus } from 'src/features/utils/ui/renderPaymentStatus'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'

const validatePageParam = (page: string | null) => {
  if (page && page !== '' && !isNaN(parseInt(page)) && parseInt(page, 10) >= 0) {
    return parseInt(page, 10)
  } else {
    return null
  }
}

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

const statusColors: { [key: string]: any } = {
  processing: { color: 'secondary.main', icon: 'tabler:reload' },
  completed: { color: 'success.main', icon: 'tabler:circle-check-filled' },
  failed: { color: 'error.main', icon: 'tabler:circle-x-filled' }
}

const startOfCurrentMonth = startOfMonth(new Date())
const startOfMonthDate = format(startOfCurrentMonth, 'yyyy-MM-dd')
const endOfCurrentMonth = endOfMonth(new Date())
const endOfMonthDate = format(endOfCurrentMonth, 'yyyy-MM-dd')

const CustomInput = forwardRef((props: PickerProps, ref) => {
  const startDate = props.start !== null ? format(props.start, 'dd.MM.yyyy') : ''
  const endDate = props.end !== null ? ` - ${props.end && format(props.end, 'dd.MM.yyyy')}` : null
  const value = `${startDate}${endDate !== null ? endDate : ''}`

  return <TextField size='small' fullWidth inputRef={ref} label={props.label || ''} {...props} value={value} />
})

const PaymentsList = () => {
  // ** State
  const [isFiltered, setIsFiltered] = useState<boolean>(false)
  const [isPageChanged, setIsPageChanged] = useState<boolean>(false)
  const [loadingQueries, setLoadingQueries] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 12
  })

  const [date, setDate] = useState<(string | null)[]>([startOfMonthDate, endOfMonthDate])
  const [statusQuery, setStatusQuery] = useState<string>('completed')
  const [bankTypeQuery, setBankTypeQuery] = useState<string>('')
  const [tariffTypeQuery, setTariffTypeQuery] = useState<string>('')
  const [payerQuery, setPayerQuery] = useState<LiteModelType | null>(null)
  const [schoolQuery, setSchoolQuery] = useState<LiteModelType | null>(null)

  const isFirstLoad = useRef<boolean>(true)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // ** Hooks
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { paymentsParams, setSearchParams } = useContext(ParamsContext)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { payments_list } = useSelector((state: RootState) => state.payments)

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
    if (
      router.isReady &&
      !users_lite_list.loading &&
      users_lite_list.data &&
      !schools_lite_list.loading &&
      schools_lite_list.data
    ) {
      const page = validatePageParam(searchParams.get('page'))
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

      const dateToSet: (string | null)[] = [startOfMonthDate, endOfMonthDate]
      if (isFirstLoad.current) {
        if (start_date) {
          dateToSet[0] = start_date
        } else if (paymentsParams.start_date) {
          paramsToRedirect.start_date = paymentsParams.start_date
          dateToSet[0] = validateSearchParam(paymentsParams.start_date as string)
        }

        if (end_date) {
          dateToSet[1] = end_date
        } else if (paymentsParams.end_date) {
          paramsToRedirect.end_date = paymentsParams.end_date
          dateToSet[1] = validateSearchParam(paymentsParams.end_date as string)
        }

        setDate(dateToSet)
        isFirstLoad.current = false
      }

      if (status) {
        paramsToSet.status = status
        setStatusQuery(status)
      } else if (paymentsParams.status) {
        paramsToRedirect.status = paymentsParams.status
        setStatusQuery(validateStatusParam(paymentsParams.status as string) || '')
      }

      if (bankType) {
        paramsToSet.bank_type = bankType
        setBankTypeQuery(bankType)
      } else if (paymentsParams.bank_type) {
        paramsToRedirect.bank_type = paymentsParams.bank_type
        setBankTypeQuery(validateBankTypeParam(paymentsParams.bank_type as string) || '')
      }

      if (tariffType) {
        paramsToSet.tariff_type = tariffType
        setTariffTypeQuery(tariffType)
      } else if (paymentsParams.tariff_type) {
        paramsToRedirect.tariff_type = paymentsParams.tariff_type
        setTariffTypeQuery(validateTariffTypeParam(paymentsParams.tariff_type as string) || '')
      }

      if (payerId) {
        paramsToSet.payer_id = payerId
        setPayerQuery(users_lite_list.data.find((user: LiteModelType) => payerId === user.key) || null)
      } else if (paymentsParams.payer_id) {
        paramsToRedirect.payer_id = paymentsParams.payer_id
        setPayerQuery(
          users_lite_list.data.find((user: LiteModelType) => (paymentsParams.payer_id as string) === user.key) || null
        )
      }

      if (schoolId) {
        paramsToSet.school_id = schoolId
        setSchoolQuery(schools_lite_list.data.find((school: LiteModelType) => schoolId === school.key) || null)
      } else if (paymentsParams.school_id) {
        paramsToRedirect.school_id = paymentsParams.school_id
        setSchoolQuery(
          schools_lite_list.data.find((school: LiteModelType) => (paymentsParams.school_id as string) === school.key) ||
            null
        )
      }

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (paymentsParams.search) {
        paramsToRedirect.search = paymentsParams.search
        setSearchValue(validateSearchParam(paymentsParams.search as string))
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (paymentsParams.page) {
          paramsToRedirect.page = paymentsParams.page
          setPagination({ pageIndex: parseInt(paymentsParams.page as string), pageSize: 12 })
        } else if (page === null && !paymentsParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('paymentsParams', paramsToSet)
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
  }, [router, users_lite_list.data, users_lite_list.loading])

  useEffect(() => {
    const urlParams: any = {
      is_list: true,
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize
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
    if (sorting.length !== 0) {
      urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
    }

    const timeoutId = setTimeout(() => {
      dispatch(fetchPayments(urlParams))
    }, 400)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [
    dispatch,
    pagination,
    searchValue,
    bankTypeQuery,
    tariffTypeQuery,
    statusQuery,
    payerQuery,
    schoolQuery,
    date,
    sorting
  ])

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
        offset: 0,
        is_select: true
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

  useEffect(() => {
    setIsPageChanged(true)
    if (router.isReady && !loadingQueries) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', pagination.pageIndex.toString())
      router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize])

  const clearFilters = () => {
    setSearchValue('')
    setBankTypeQuery('')
    setTariffTypeQuery('')
    setStatusQuery('')
    setPayerQuery(null)
    setSchoolQuery(null)
    setDate([null, null])
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '0')
    params.delete('search')
    params.delete('bank_type')
    params.delete('tariff_type')
    params.delete('status')
    params.delete('payer_id')
    params.delete('school_id')
    params.delete('start_date')
    params.delete('end_date')
    const contextParams = paymentsParams
    delete contextParams.search
    delete contextParams.bank_type
    delete contextParams.tariff_type
    delete contextParams.status
    delete contextParams.payer_id
    delete contextParams.school_id
    delete contextParams.start_date
    delete contextParams.end_date
    setSearchParams('paymentsParams', contextParams)
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleSearchValue = (val: string) => {
    setSearchValue(val)
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('search', val)
    } else {
      params.delete('search')
      const contextParams = delete paymentsParams.search
      setSearchParams('paymentsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
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
      const contextParams = delete paymentsParams.bank_type
      setSearchParams('paymentsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
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
      const contextParams = delete paymentsParams.tariff_type
      setSearchParams('paymentsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
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
      const contextParams = delete paymentsParams.status
      setSearchParams('paymentsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterPayer = (val: LiteModelType | null) => {
    setPayerQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('payer_id')

    const contextParams = delete paymentsParams.payer_id
    setSearchParams('paymentsParams', contextParams)

    if (val) {
      params.set('payer_id', val.key.toString())
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterSchool = (val: LiteModelType | null) => {
    setSchoolQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('school_id')

    const contextParams = delete paymentsParams.school_id
    setSearchParams('paymentsParams', contextParams)

    if (val) {
      params.set('school_id', val.key.toString())
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleDateParam = (start_date: string | null, end_date: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    const contextParams = { ...paymentsParams }
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
    setSearchParams('paymentsParams', contextParams)
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const columns = useMemo<MRT_ColumnDef<PaymentType>[]>(
    () => [
      {
        accessorKey: 'created_at',
        accessorFn: row => row.created_at,
        id: 'created_at',
        header: t('SentTime'),
        Cell: ({ row }) => (
          <Typography>
            {row.original.created_at && format(new Date(row.original.created_at), 'dd.MM.yyyy HH:mm')}
          </Typography>
        )
      },
      {
        accessorKey: 'user',
        accessorFn: row => row.payer?.last_name,
        id: 'user',
        header: t('Payer') + '/' + t('School'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              component={Link}
              href={`/users/view/${row.original.payer?.id}`}
              color={'primary.main'}
              sx={{ fontWeight: '600', textDecoration: 'none' }}
            >
              {renderUserFullname(
                row.original.payer?.last_name,
                row.original.payer?.first_name,
                row.original.payer?.middle_name
              )}
            </Typography>
            <Typography>
              {row.original.school?.parent && `${row.original.school.parent.name}, `}
              {row.original.school?.name}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'amount',
        accessorFn: row => row.amount,
        id: 'amount',
        header: t('Amount') + '/' + t('Status'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: 600 }}>{row.original.amount} TMT</Typography>
            <Box
              display='flex'
              justifyContent='flex-start'
              alignItems='center'
              gap={2}
              sx={{
                color: row.original.status ? statusColors[row.original.status].color : 'text.primary',
                '& svg': {
                  color: row.original.status ? statusColors[row.original.status].color : 'text.primary'
                }
              }}
            >
              <Icon icon={row.original.status ? statusColors[row.original.status].icon : ''} fontSize='1.25rem' />
              <Typography alignItems='center' color='inherit'>
                {renderPaymentStatus(row.original.status)}
              </Typography>
            </Box>
          </Box>
        )
      },
      {
        accessorKey: 'students',
        accessorFn: row => row.students && row.students.length,
        id: 'students',
        header: t('Children'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h6' fontWeight={600}>
              {row.original.month} <Translations text='month' />
            </Typography>
            <Typography>
              {row.original.students?.length} <Translations text='children' />
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'tariff_type',
        accessorFn: row => row.tariff_type,
        id: 'tariff_type',
        header: t('Tariff'),
        Cell: ({ row }) => <Typography>{renderTariffType(row.original.tariff_type)}</Typography>
      },
      {
        accessorKey: 'bank_type',
        accessorFn: row => row.bank_type,
        id: 'bank_type',
        header: t('Bank') + '/' + t('CardNumber'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h6' fontWeight={600}>
              {renderBankType(row.original.bank_type)}
            </Typography>
            <Typography>{row.original.card_name}</Typography>
          </Box>
        )
      }
    ],
    [t]
  )

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableHiding: true,
    enableRowActions: true,
    enableRowSelection: true,
    enableStickyHeader: true,
    enableGlobalFilter: false,
    enableDensityToggle: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    isMultiSortEvent: () => true,
    selectAllMode: 'page',
    paginationDisplayMode: 'pages',
    positionActionsColumn: 'last',
    positionToolbarAlertBanner: 'none',
    muiTableBodyCellProps: {
      padding: 'none',
      sx: {
        minHeight: 62,
        height: 62
      }
    },
    muiTablePaperProps: { sx: { boxShadow: 'none!important' } },
    muiBottomToolbarProps: { sx: { paddingLeft: 4 } },
    muiTableContainerProps: { sx: { maxHeight: 'none', border: 'none' } },
    muiSelectAllCheckboxProps: { sx: { padding: 0 } },
    muiSelectCheckboxProps: { sx: { padding: 0 } },
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
      fullWidth: true
    },
    muiPaginationProps: {
      color: 'primary',
      rowsPerPageOptions: [12, 24, 36],
      shape: 'rounded',
      variant: 'outlined',
      showFirstButton: false,
      showLastButton: false
    },
    columns,
    data: payments_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: payments_list.error
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    renderTopToolbar: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'end',
          alignItems: 'center'
        }}
      >
        <MRT_ShowHideColumnsButton table={table} />
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
      <Box display='flex' flexDirection='row' alignItems='center' gap={3}>
        <Typography sx={{ color: 'text.secondary' }}>
          <Translations text='Total' /> {payments_list.total}.
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          <Translations text='TotalAmount' />{' '}
          {payments_list.total_amount &&
            (Object.values(payments_list.total_amount).reduce((acc: any, value: any) => acc + value, 0) as number)}{' '}
          TMT.
        </Typography>
      </Box>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/payments/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
      </Box>
    ),
    rowCount: payments_list.total,
    initialState: {
      columnVisibility: {}
    },
    state: {
      density: 'compact',
      isLoading: payments_list.loading,
      pagination,
      rowSelection,
      sorting
    }
  })

  if (payments_list.error) {
    return <Error error={payments_list.error} />
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('SearchFilter')}
              action={
                <Box display={'flex'} gap={3}>
                  {isFiltered && (
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
                  )}
                  <Button
                    color='success'
                    variant='tonal'
                    onClick={() => router.push('/payments/report')}
                    sx={{ px: 6, minWidth: 260 }}
                    startIcon={<Icon icon='tabler:clipboard-text' fontSize={20} />}
                  >
                    <Translations text='ReportBySchool' />
                  </Button>
                </Box>
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
              hasBankTypeFilter={true}
              bankType={bankTypeQuery}
              tariffType={tariffTypeQuery}
              payer={payerQuery}
              school={schoolQuery}
              handleBankTypeFilter={handleBankTypeFilter}
              handleTariffTypeFilter={handleTariffTypeFilter}
              handleFilterPayer={handleFilterPayer}
              handleFilterSchool={handleFilterSchool}
            />

            <Divider sx={{ my: '0 !important' }} />

            <PaymentTotals />

            <Divider sx={{ my: '0 !important' }} />
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

PaymentsList.acl = {
  action: 'read',
  subject: 'admin_payments'
}

export default PaymentsList
