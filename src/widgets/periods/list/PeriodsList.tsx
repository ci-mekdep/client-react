// ** React Imports
import { useState, useEffect, useContext, useMemo, useRef } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { Theme } from '@mui/material/styles'
import Checkbox from '@mui/material/Checkbox'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import useMediaQuery from '@mui/material/useMediaQuery'
import FormControlLabel from '@mui/material/FormControlLabel'
import { InputAdornment } from '@mui/material'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import { deletePeriod, fetchPeriods } from 'src/features/store/apps/periods'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Types Imports
import { RootState, AppDispatch } from 'src/features/store'
import { PeriodType } from 'src/entities/school/PeriodType'

// ** Custom Components Imports
import CustomTextField from 'src/shared/components/mui/text-field'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import { useDialog } from 'src/app/context/DialogContext'
import Error from 'src/widgets/general/Error'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { ParamsContext } from 'src/app/context/ParamsContext'
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

const validatePageParam = (page: string | null) => {
  if (page && page !== '' && !isNaN(parseInt(page)) && parseInt(page, 10) >= 0) {
    return parseInt(page, 10)
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

const PeriodsList = () => {
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

  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // ** Hooks
  const router = useRouter()
  const pathname = usePathname()
  const showDialog = useDialog()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { periodsParams, setSearchParams } = useContext(ParamsContext)
  const { periods_list } = useSelector((state: RootState) => state.periods)
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('xl'))

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
      const page = validatePageParam(searchParams.get('page'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (periodsParams.search) {
        paramsToRedirect.search = periodsParams.search
        setSearchValue(validateSearchParam(periodsParams.search as string))
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (periodsParams.page) {
          paramsToRedirect.page = periodsParams.page
          setPagination({ pageIndex: parseInt(periodsParams.page as string), pageSize: 12 })
        } else if (page === null && !periodsParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('periodsParams', paramsToSet)
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
        is_list: true,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize
      }
      if (searchValue !== '') {
        urlParams['search'] = searchValue
      }
      if (sorting.length !== 0) {
        urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
      }
      const timeoutId = setTimeout(() => {
        dispatch(fetchPeriods(urlParams))
      }, 400)

      return () => clearTimeout(timeoutId)
    }
  }, [dispatch, searchValue, sorting, pagination, loadingQueries])

  useEffect(() => {
    if (!searchValue) {
      setIsFiltered(false)
    } else {
      setIsFiltered(true)
    }
  }, [searchValue])

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
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '0')
    params.delete('search')
    const contextParams = delete periodsParams.search
    setSearchParams('periodsParams', contextParams)
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
      const contextParams = delete periodsParams.search
      setSearchParams('periodsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleShowDialog = async (arr?: string[]) => {
    const confirmed = await showDialog()
    if (confirmed) {
      if (arr) {
        handleDeletePeriod(arr)
      } else {
        handleDeletePeriod(Object.keys(rowSelection))
        setRowSelection({})
      }
    } else {
      setRowSelection({})
    }
  }

  const handleDeletePeriod = async (arr: string[]) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deletePeriod(arr))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        const urlParams: any = {
          is_list: true,
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize
        }
        if (searchValue !== '') {
          urlParams['search'] = searchValue
        }
        if (sorting.length !== 0) {
          urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
        }
        if (urlParams['search']) {
          const timeoutId = setTimeout(() => {
            dispatch(fetchPeriods(urlParams))
          }, 400)

          return () => clearTimeout(timeoutId)
        } else {
          dispatch(fetchPeriods(urlParams))
        }
        setSearchValue(null)
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const columns = useMemo<MRT_ColumnDef<PeriodType>[]>(
    () => [
      {
        accessorKey: 'title',
        accessorFn: row => row.title,
        id: 'title',
        header: t('Name'),
        Cell: ({ row }) => <Typography>{row.original.title}</Typography>
      },
      {
        accessorKey: 'classrooms_count',
        accessorFn: row => row.data_counts?.classrooms_count,
        id: 'classrooms_count',
        header: t('ClassroomsCount'),
        Cell: ({ row }) => <Typography>{row.original.data_counts?.classrooms_count}</Typography>
      },
      {
        accessorKey: 'students_count',
        accessorFn: row => row.data_counts?.students_count,
        id: 'students_count',
        header: t('StudentsCount'),
        Cell: ({ row }) => <Typography>{row.original.data_counts?.students_count}</Typography>
      },
      {
        accessorKey: 'timetables_count',
        accessorFn: row => row.data_counts?.timetables_count,
        id: 'timetables_count',
        header: t('TimetablesCount'),
        Cell: ({ row }) => <Typography>{row.original.data_counts?.timetables_count}</Typography>
      },
      {
        accessorKey: 'teachers_count',
        accessorFn: row => row.data_counts?.teachers_count,
        id: 'teachers_count',
        header: t('TeachersCount'),
        Cell: ({ row }) => <Typography>{row.original.data_counts?.teachers_count}</Typography>
      },
      {
        accessorKey: 'subject_hours',
        accessorFn: row => row.data_counts?.subject_hours,
        id: 'subject_hours',
        header: t('SubjectHours'),
        Cell: ({ row }) => <Typography>{row.original.data_counts?.subject_hours}</Typography>
      },
      {
        accessorKey: 'grades_count',
        accessorFn: row => row.data_counts?.grades_count,
        id: 'grades_count',
        header: t('GradesCount'),
        Cell: ({ row }) => <Typography>{row.original.data_counts?.grades_count}</Typography>
      },
      {
        accessorKey: 'absents_count',
        accessorFn: row => row.data_counts?.absents_count,
        id: 'absents_count',
        header: t('AbsentsCount'),
        Cell: ({ row }) => <Typography>{row.original.data_counts?.absents_count}</Typography>
      },
      {
        accessorKey: 'school',
        accessorFn: row => row.school?.name,
        id: 'school',
        header: t('School'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography>{row.original.school?.name}</Typography>
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              {row.original.school?.parent?.name}
            </Typography>
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
    data: periods_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: periods_list.error
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
      <Typography sx={{ color: 'text.secondary' }}>
        <Translations text='Total' /> {periods_list.total}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/periods/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
        {ability?.can('write', 'admin_periods') ? (
          <Button
            variant='tonal'
            color='error'
            size='small'
            onClick={() => {
              handleShowDialog([row.original.id])
            }}
            startIcon={<Icon icon='tabler:trash' fontSize={20} />}
          >
            <Translations text='Delete' />
          </Button>
        ) : null}
      </Box>
    ),
    rowCount: periods_list.total,
    initialState: {
      columnVisibility: {
        timetables_count: false,
        teachers_count: false,
        subject_hours: false,
        grades_count: false,
        absents_count: false
      }
    },
    state: {
      density: 'compact',
      isLoading: periods_list.loading || loadingQueries,
      pagination,
      rowSelection,
      sorting
    }
  })

  if (periods_list.error) {
    return <Error error={periods_list.error} />
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
                  {ability.can('write', 'admin_periods') ? (
                    <Button
                      variant='contained'
                      color='error'
                      fullWidth
                      sx={{ visibility: rowSelection && Object.keys(rowSelection).length !== 0 ? 'visible' : 'hidden' }}
                      startIcon={<Icon icon='tabler:trash' />}
                      onClick={() => {
                        handleShowDialog()
                      }}
                    >
                      <Translations text='DeleteSelected' />
                    </Button>
                  ) : null}
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
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={9} md={6.5} lg={7.2}>
                  <CustomTextField
                    fullWidth
                    value={searchValue}
                    ref={searchInputRef}
                    placeholder={t('PeriodSearch') as string}
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
                <Grid item xs={12} sm={3} md={2} lg={1.8} xl={1.5}>
                  <FormControlLabel label={t('Archived')} control={<Checkbox name='archived' />} />
                </Grid>
                {ability.can('write', 'admin_periods') ? (
                  <>
                    <Grid hidden={hidden} item xl={0.3}>
                      <Divider orientation='vertical' sx={{ m: 0, height: '85%' }} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={3.5} lg={3}>
                      <Button
                        sx={{ mb: 2 }}
                        component={Link}
                        variant='contained'
                        fullWidth
                        href='/periods/create'
                        startIcon={<Icon icon='tabler:plus' />}
                      >
                        <Translations text='AddPeriod' />
                      </Button>
                    </Grid>
                  </>
                ) : null}
              </Grid>
            </CardContent>
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default PeriodsList
