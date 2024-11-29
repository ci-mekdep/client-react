// ** React Imports
import { useState, useEffect, useContext, useRef, useMemo } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Divider,
  Grow,
  InputAdornment,
  MenuItem,
  MenuList,
  Paper,
  Popper
} from '@mui/material'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchShifts } from 'src/features/store/apps/shifts'
import { fetchClassroomsLite } from 'src/features/store/apps/classrooms'
import { deleteTimetable, fetchTimetables } from 'src/features/store/apps/timetables'

// ** Third Party Imports
import toast from 'react-hot-toast'
import format from 'date-fns/format'

// ** Types Imports
import { RootState, AppDispatch } from 'src/features/store'
import { ShiftListType } from 'src/entities/classroom/ShiftType'
import { TimetableType } from 'src/entities/classroom/TimetableType'

// ** Custom Components Imports
import TableHeader from 'src/widgets/timetables/list/TableHeader'
import CustomTextField from 'src/shared/components/mui/text-field'

// ** Store Import
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/features/hooks/useAuth'
import { useDialog } from 'src/app/context/DialogContext'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import Error from 'src/widgets/general/Error'
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
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

const validateIdsParam = (search: string[]) => {
  const filteredArr = search.filter(value => {
    if (value !== '' && !isNaN(parseInt(value)) && parseInt(value, 10) >= 0) return true

    return false
  })

  if (filteredArr.length > 0) return filteredArr

  return null
}

const TimetablesList = () => {
  // ** State
  const [isFiltered, setIsFiltered] = useState<boolean>(false)
  const [isPageChanged, setIsPageChanged] = useState<boolean>(false)
  const [loadingQueries, setLoadingQueries] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [shiftsQuery, setShiftsQuery] = useState<ShiftListType[]>([])
  const [classroomsQuery, setClassroomsQuery] = useState<LiteModelType[]>([])
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 12
  })

  const [open, setOpen] = useState<boolean>(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const anchorRef = useRef<HTMLDivElement | null>(null)

  // ** Hooks
  const router = useRouter()
  const pathname = usePathname()
  const showDialog = useDialog()
  const { t } = useTranslation()
  const { current_school } = useAuth()
  const searchParams = useSearchParams()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { timetablesParams, setSearchParams } = useContext(ParamsContext)
  const { timetables_list } = useSelector((state: RootState) => state.timetables)
  const { shifts_list } = useSelector((state: RootState) => state.shifts)
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)

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
      !shifts_list.loading &&
      shifts_list.data &&
      !classrooms_lite_list.loading &&
      classrooms_lite_list.data
    ) {
      const searchQuery = validateSearchParam(searchParams.get('search'))
      const page = validatePageParam(searchParams.get('page'))
      const shift_ids = validateIdsParam(searchParams.getAll('shift_ids'))
      const classroom_ids = validateIdsParam(searchParams.getAll('classroom_ids'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (timetablesParams.search) {
        paramsToRedirect.search = timetablesParams.search
        setSearchValue(validateSearchParam(timetablesParams.search as string))
      }

      if (shift_ids) {
        paramsToSet.shift_ids = shift_ids
        setShiftsQuery(
          shifts_list.data.filter((shift: ShiftListType) => shift_ids.includes(shift.id.toString())) || null
        )
      } else if (timetablesParams.shift_ids) {
        paramsToRedirect.shift_ids = timetablesParams.shift_ids
        setShiftsQuery(
          shifts_list.data.filter(
            (shift: ShiftListType) =>
              timetablesParams.shift_ids && timetablesParams.shift_ids.includes(shift.id.toString())
          ) || null
        )
      }

      if (classroom_ids) {
        paramsToSet.classroom_ids = classroom_ids
        setClassroomsQuery(
          classrooms_lite_list.data.filter((classroom: LiteModelType) =>
            classroom_ids.includes(classroom.key.toString())
          ) || null
        )
      } else if (timetablesParams.classroom_ids) {
        paramsToRedirect.classroom_ids = timetablesParams.classroom_ids
        setClassroomsQuery(
          classrooms_lite_list.data.filter(
            (classroom: LiteModelType) =>
              timetablesParams.classroom_ids && timetablesParams.classroom_ids.includes(classroom.key.toString())
          ) || null
        )
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (timetablesParams.page) {
          paramsToRedirect.page = timetablesParams.page
          setPagination({ pageIndex: parseInt(timetablesParams.page as string), pageSize: 12 })
        } else if (page === null && !timetablesParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('timetablesParams', paramsToSet)
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
  }, [classrooms_lite_list.loading, router, shifts_list.loading])

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
      if (shiftsQuery.length !== 0) {
        urlParams['shift_ids'] = shiftsQuery.map(shift => shift.id)
      }
      if (classroomsQuery.length !== 0) {
        urlParams['classroom_ids'] = classroomsQuery.map(classroom => classroom.key)
      }
      if (sorting.length !== 0) {
        urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
      }
      const timeoutId = setTimeout(() => {
        dispatch(fetchTimetables(urlParams))
      }, 400)

      return () => clearTimeout(timeoutId)
    }
  }, [dispatch, searchValue, pagination, classroomsQuery, shiftsQuery, sorting, loadingQueries])

  useEffect(() => {
    current_school !== null && dispatch(fetchClassroomsLite({ limit: 200, offset: 0 }))
  }, [current_school, dispatch])

  useEffect(() => {
    current_school !== null &&
      dispatch(
        fetchShifts({
          limit: 100,
          offset: 0
        })
      )
  }, [current_school, dispatch])

  useEffect(() => {
    if (!searchValue && shiftsQuery.length === 0 && classroomsQuery.length === 0) {
      setIsFiltered(false)
    } else {
      setIsFiltered(true)
    }
  }, [classroomsQuery, searchValue, shiftsQuery])

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
    setShiftsQuery([])
    setClassroomsQuery([])
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '0')
    params.delete('search')
    params.delete('shift_ids')
    params.delete('classroom_ids')
    const contextParams = timetablesParams
    delete contextParams.search
    delete contextParams.shift_ids
    delete contextParams.classroom_ids
    setSearchParams('timetablesParams', contextParams)
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
      const contextParams = delete timetablesParams.search
      setSearchParams('timetablesParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterShift = (val: ShiftListType[]) => {
    setShiftsQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('shift_ids')

    const contextParams = delete timetablesParams.shift_ids
    setSearchParams('timetablesParams', contextParams)

    if (val.length > 0) {
      val.map((shift: ShiftListType) => {
        params.append('shift_ids', shift.id.toString())
      })
    }

    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterClassroom = (val: LiteModelType[]) => {
    setClassroomsQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('classroom_ids')

    const contextParams = delete timetablesParams.classroom_ids
    setSearchParams('timetablesParams', contextParams)

    if (val.length > 0) {
      val.map((classroom: LiteModelType) => {
        params.append('classroom_ids', classroom.key.toString())
      })
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleShowDialog = async (arr?: string[]) => {
    const confirmed = await showDialog()
    if (confirmed) {
      if (arr) {
        handleDeleteTimetable(arr)
      } else {
        handleDeleteTimetable(Object.keys(rowSelection))
        setRowSelection({})
      }
    } else {
      setRowSelection({})
    }
  }

  const handleDeleteTimetable = async (arr: string[]) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteTimetable(arr))
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
        if (shiftsQuery.length !== 0) {
          urlParams['shift_ids'] = shiftsQuery.map(shift => shift.id)
        }
        if (classroomsQuery.length !== 0) {
          urlParams['classroom_ids'] = classroomsQuery.map(classroom => classroom.key)
        }
        if (sorting.length !== 0) {
          urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
        }
        if (urlParams['search']) {
          const timeoutId = setTimeout(() => {
            dispatch(fetchTimetables(urlParams))
          }, 400)

          return () => clearTimeout(timeoutId)
        } else {
          dispatch(fetchTimetables(urlParams))
        }
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const columns = useMemo<MRT_ColumnDef<TimetableType>[]>(
    () => [
      {
        accessorKey: 'classroom',
        accessorFn: row => row.classroom?.name,
        id: 'classroom',
        header: t('Classroom'),
        Cell: ({ row }) => (
          <Typography
            component={Link}
            href={`/classrooms/view/${row.original.classroom?.id}`}
            color={'primary.main'}
            sx={{ fontWeight: '600', textDecoration: 'none' }}
          >
            {row.original.classroom?.name}
          </Typography>
        )
      },
      {
        accessorKey: 'shift',
        accessorFn: row => row.shift?.name,
        id: 'shift',
        header: t('Shift'),
        Cell: ({ row }) => <Typography>{row.original.shift?.name}</Typography>
      },
      {
        accessorKey: 'updated_at',
        accessorFn: row => row.updated_at,
        id: 'updated_at',
        header: t('UpdatedTime'),
        Cell: ({ row }) => (
          <Typography>
            {row.original.updated_at && format(new Date(row.original.updated_at), 'dd.MM.yyyy HH:mm')}
          </Typography>
        )
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
    data: timetables_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: timetables_list.error
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
        <Translations text='Total' /> {timetables_list.total}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/timetables/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
        {ability?.can('write', 'admin_timetables') ? (
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
    rowCount: timetables_list.total,
    initialState: {
      columnVisibility: {}
    },
    state: {
      density: 'compact',
      isLoading: timetables_list.loading || loadingQueries,
      pagination,
      rowSelection,
      sorting
    }
  })

  if (timetables_list.error) {
    return <Error error={timetables_list.error} />
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
                  {ability.can('write', 'admin_timetables') ? (
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
                <Grid item xs={12} sm={12} md={9} lg={9}>
                  <CustomTextField
                    fullWidth
                    value={searchValue}
                    ref={searchInputRef}
                    placeholder={t('TimetableSearch') as string}
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
                {ability.can('write', 'admin_timetables') ? (
                  <Grid item xs={12} sm={12} md={3} xl={3}>
                    <ButtonGroup variant='contained' ref={anchorRef} aria-label='split button' sx={{ display: 'flex' }}>
                      <Button
                        component={Link}
                        variant='contained'
                        fullWidth
                        href='/timetables/create'
                        startIcon={<Icon icon='tabler:plus' />}
                      >
                        <Translations text='AddTimetable' />
                      </Button>
                      <Button
                        sx={{ px: '0' }}
                        aria-haspopup='menu'
                        onClick={() => setOpen(prevOpen => !prevOpen)}
                        aria-label='select merge strategy'
                        aria-expanded={open ? 'true' : undefined}
                        aria-controls={open ? 'split-button-menu' : undefined}
                      >
                        <Icon icon='tabler:chevron-down' />
                      </Button>
                    </ButtonGroup>
                    <Popper
                      sx={{ zIndex: 9999 }}
                      open={open}
                      anchorEl={anchorRef.current}
                      role={undefined}
                      transition
                      disablePortal
                    >
                      {({ TransitionProps, placement }) => (
                        <Grow
                          {...TransitionProps}
                          style={{ transformOrigin: placement === 'bottom' ? 'right top' : 'right bottom' }}
                        >
                          <Paper>
                            <ClickAwayListener onClickAway={() => setOpen(false)}>
                              <MenuList id='split-button-menu'>
                                <MenuItem component={Link} href='/timetables/import'>
                                  <Translations text='AddMultiple' />
                                </MenuItem>
                              </MenuList>
                            </ClickAwayListener>
                          </Paper>
                        </Grow>
                      )}
                    </Popper>
                  </Grid>
                ) : null}
              </Grid>
            </CardContent>

            <Divider sx={{ my: '0 !important' }} />

            <TableHeader
              shiftsStore={shifts_list.data}
              shiftsQuery={shiftsQuery}
              handleFilterShift={handleFilterShift}
              classroomsStore={classrooms_lite_list.data}
              classroomsQuery={classroomsQuery}
              handleFilterClassroom={handleFilterClassroom}
            />
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

TimetablesList.acl = {
  action: 'read',
  subject: 'admin_timetables'
}

export default TimetablesList
