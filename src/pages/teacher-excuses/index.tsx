// ** React Imports
import { useState, useEffect, useContext, useRef, useMemo } from 'react'

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
import { Divider, InputAdornment } from '@mui/material'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Types Imports
import { RootState, AppDispatch } from 'src/features/store'

// ** Custom Components Imports
import CustomTextField from 'src/shared/components/mui/text-field'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import { useDialog } from 'src/app/context/DialogContext'
import Error from 'src/widgets/general/Error'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { TeacherExcuseType } from 'src/entities/school/TeacherExcuseType'
import { deleteTeacherExcuse, fetchTeacherExcuses } from 'src/features/store/apps/teacherExcuses'
import TableHeader from 'src/widgets/teacher-excuses/list/TableHeader'
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
import { ParamsContext } from 'src/app/context/ParamsContext'
import {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_RowSelectionState,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MaterialReactTable,
  useMaterialReactTable
} from 'material-react-table'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import { fetchUsersLite } from 'src/features/store/apps/user'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { renderTeacherExcuseReason } from 'src/features/utils/ui/renderTeacherExcuseReason'
import format from 'date-fns/format'
import CustomChip from 'src/shared/components/mui/chip'
import differenceInDays from 'date-fns/differenceInDays'

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

const validateReasonParam = (reason: string | null) => {
  if (reason && reason !== '') {
    if (
      reason === 'excuse_vacation' ||
      reason === 'excuse_unpaid' ||
      reason === 'excuse_paid' ||
      reason === 'excuse_business_trip' ||
      reason === 'excuse_study_trip' ||
      reason === 'excuse_maternity' ||
      reason === 'excuse_ill'
    ) {
      return reason
    } else {
      return null
    }
  }
}

const validateIdParam = (id: string | null) => {
  if (id && id !== '') {
    return id
  } else {
    return null
  }
}

const TeacherExcusesList = () => {
  // ** State
  const [isFiltered, setIsFiltered] = useState<boolean>(false)
  const [isPageChanged, setIsPageChanged] = useState<boolean>(false)
  const [loadingQueries, setLoadingQueries] = useState<boolean>(true)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 12
  })

  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [school, setSchool] = useState<LiteModelType | null>(null)
  const [teacher, setTeacher] = useState<LiteModelType | null>(null)
  const [reason, setReason] = useState<string>('')
  const [date, setDate] = useState<string | null>(null)

  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // ** Hooks
  const router = useRouter()
  const pathname = usePathname()
  const showDialog = useDialog()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { teacherExcusesParams, setSearchParams } = useContext(ParamsContext)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { teacher_excuses_list } = useSelector((state: RootState) => state.teacherExcuses)

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
      const searchQuery = validateSearchParam(searchParams.get('search'))
      const page = validatePageParam(searchParams.get('page'))
      const school_id = validateIdParam(searchParams.get('school_id'))
      const teacher_id = validateIdParam(searchParams.get('teacher_id'))
      const reason = validateReasonParam(searchParams.get('reason'))
      const date = validateSearchParam(searchParams.get('date'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (teacherExcusesParams.search) {
        paramsToRedirect.search = teacherExcusesParams.search
        setSearchValue(validateSearchParam(teacherExcusesParams.search as string))
      }

      if (school_id) {
        paramsToSet.school_id = school_id
        setSchool(schools_lite_list.data.find((school: LiteModelType) => school_id === school.key) || null)
      } else if (teacherExcusesParams.school_id) {
        paramsToRedirect.school_id = teacherExcusesParams.school_id
        setSchool(
          schools_lite_list.data.find(
            (school: LiteModelType) => (teacherExcusesParams.school_id as string) === school.key
          ) || null
        )
      }

      if (teacher_id) {
        paramsToSet.teacher_id = teacher_id
        setTeacher(users_lite_list.data.find((user: LiteModelType) => teacher_id === user.key) || null)
      } else if (teacherExcusesParams.teacher_id) {
        paramsToRedirect.teacher_id = teacherExcusesParams.teacher_id
        setTeacher(
          users_lite_list.data.find(
            (user: LiteModelType) => (teacherExcusesParams.teacher_id as string) === user.key
          ) || null
        )
      }

      if (reason) {
        paramsToSet.reason = reason
        setReason(reason)
      } else if (teacherExcusesParams.reason) {
        paramsToRedirect.reason = teacherExcusesParams.reason
        setReason(validateReasonParam(teacherExcusesParams.reason as string) || '')
      }

      if (date) {
        paramsToSet.date = date
        setDate(date)
      } else if (teacherExcusesParams.date) {
        paramsToRedirect.date = teacherExcusesParams.date
        setDate(validateSearchParam(teacherExcusesParams.date as string) || null)
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (teacherExcusesParams.page) {
          paramsToRedirect.page = teacherExcusesParams.page
          setPagination({ pageIndex: parseInt(teacherExcusesParams.page as string), pageSize: 12 })
        } else if (page === null && !teacherExcusesParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('teacherExcusesParams', paramsToSet)
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
  }, [router, schools_lite_list, users_lite_list])

  useEffect(() => {
    if (loadingQueries === false) {
      const urlParams: any = {
        is_list: true,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize
      }
      if (searchValue !== '') {
        urlParams['search'] = searchValue
      }
      if (school) {
        urlParams['school_id'] = school.key
      }
      if (teacher) {
        urlParams['teacher_id'] = teacher.key
      }
      if (reason) {
        urlParams['reason'] = reason
      }
      if (date) {
        urlParams['date'] = date
      }
      if (sorting.length !== 0) {
        urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
      }
      const timeoutId = setTimeout(() => {
        dispatch(fetchTeacherExcuses(urlParams))
      }, 400)

      return () => clearTimeout(timeoutId)
    }
  }, [dispatch, loadingQueries, pagination, reason, school, searchValue, sorting, teacher, date])

  useEffect(() => {
    dispatch(
      fetchSchoolsLite({
        limit: 750,
        offset: 0,
        is_select: true
      })
    )
    dispatch(
      fetchUsersLite({
        limit: 500,
        offset: 0,
        role: 'teacher'
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (!searchValue && !school && !teacher && reason === '' && !date) {
      setIsFiltered(false)
    } else {
      setIsFiltered(true)
    }
  }, [searchValue, reason, school, teacher, date])

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
    setSchool(null)
    setTeacher(null)
    setReason('')
    setDate(null)
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '0')
    params.delete('search')
    params.delete('school_id')
    params.delete('teacher_id')
    params.delete('reason')
    params.delete('date')
    const contextParams = teacherExcusesParams
    delete contextParams.search
    delete contextParams.school_id
    delete contextParams.teacher_id
    delete contextParams.reason
    delete contextParams.date
    setSearchParams('teacherExcusesParams', contextParams)
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
      const contextParams = delete teacherExcusesParams.search
      setSearchParams('teacherExcusesParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterSchool = (val: LiteModelType | null) => {
    setSchool(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('school_id')

    const contextParams = delete teacherExcusesParams.school_id
    setSearchParams('teacherExcusesParams', contextParams)

    if (val) {
      params.set('school_id', val.key)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterTeacher = (val: LiteModelType | null) => {
    setTeacher(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('teacher_id')

    const contextParams = delete teacherExcusesParams.teacher_id
    setSearchParams('teacherExcusesParams', contextParams)

    if (val) {
      params.set('teacher_id', val.key.toString())
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterReason = (val: string | null) => {
    if (val) {
      setReason(val)
    } else setReason('')
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('reason', val)
    } else {
      params.delete('reason')
      const contextParams = delete teacherExcusesParams.reason
      setSearchParams('teacherExcusesParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterDate = (val: string | null) => {
    setDate(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('date')

    const contextParams = delete teacherExcusesParams.date
    setSearchParams('teacherExcusesParams', contextParams)

    if (val) {
      params.set('date', val)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleShowDialog = async (arr?: string[]) => {
    const confirmed = await showDialog()
    if (confirmed) {
      if (arr) {
        handleDeleteTeacherExcuse(arr)
      } else {
        handleDeleteTeacherExcuse(Object.keys(rowSelection))
        setRowSelection({})
      }
    } else {
      setRowSelection({})
    }
  }

  const handleDeleteTeacherExcuse = async (arr: string[]) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteTeacherExcuse(arr))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        const urlParams: any = {
          is_list: true,
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize
        }
        if (school) {
          urlParams['school_id'] = school.key
        }
        if (teacher) {
          urlParams['teacher_id'] = teacher.key
        }
        if (reason) {
          urlParams['reason'] = reason
        }
        if (date) {
          urlParams['date'] = date
        }
        if (sorting.length !== 0) {
          urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
        }
        if (urlParams['search']) {
          const timeoutId = setTimeout(() => {
            dispatch(fetchTeacherExcuses(urlParams))
          }, 400)

          return () => clearTimeout(timeoutId)
        } else {
          dispatch(fetchTeacherExcuses(urlParams))
        }
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const columns = useMemo<MRT_ColumnDef<TeacherExcuseType>[]>(
    () => [
      {
        accessorKey: 'teacher',
        accessorFn: row => row.teacher?.last_name,
        id: 'teacher',
        header: t('Teacher'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              component={Link}
              href={`/users/view/${row.original.teacher?.id}`}
              color={'primary.main'}
              sx={{ fontWeight: '600', textDecoration: 'none' }}
            >
              {renderUserFullname(
                row.original.teacher?.last_name,
                row.original.teacher?.first_name,
                row.original.teacher?.middle_name
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
        accessorKey: 'reason',
        accessorFn: row => row.reason,
        id: 'reason',
        header: t('Reason'),
        Cell: ({ row }) => (
          <Box>
            <Typography>{renderTeacherExcuseReason(row.original.reason)}</Typography>
            {row.original.document_files && row.original.document_files.length > 0 && (
              <CustomChip
                rounded
                size='small'
                skin='light'
                color='primary'
                label={`${row.original.document_files.length} ${t('File')}`}
              />
            )}
          </Box>
        )
      },
      {
        accessorKey: 'start_date',
        accessorFn: row => row.start_date,
        id: 'start_date',
        header: `${t('ExcuseStartDate')} / ${t('ExcuseEndDate')}`,
        Cell: ({ row }) => (
          <Box>
            <Typography fontWeight={600}>
              {row.original.start_date && row.original.end_date
                ? Math.abs(differenceInDays(new Date(row.original.end_date), new Date(row.original.start_date)))
                : '-'}{' '}
              <Translations text='days' />
            </Typography>
            <Typography>
              {row.original.start_date && format(new Date(row.original.start_date), 'dd.MM.yyyy')} -{' '}
              {row.original.end_date && format(new Date(row.original.end_date), 'dd.MM.yyyy')}
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
    data: teacher_excuses_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: teacher_excuses_list.error
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
        <Translations text='Total' /> {teacher_excuses_list.total}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/teacher-excuses/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
        {ability?.can('write', 'admin_teacher_excuses') ? (
          <Button
            variant='tonal'
            color='error'
            size='small'
            onClick={() => {
              if (row.original.teacher) {
                handleShowDialog([row.original.id])
              }
            }}
            startIcon={<Icon icon='tabler:trash' fontSize={20} />}
          >
            <Translations text='Delete' />
          </Button>
        ) : null}
      </Box>
    ),
    rowCount: teacher_excuses_list.total,
    state: {
      density: 'compact',
      isLoading: teacher_excuses_list.loading || loadingQueries,
      pagination,
      rowSelection,
      sorting
    }
  })

  if (teacher_excuses_list.error) {
    return <Error error={teacher_excuses_list.error} />
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
                  {ability.can('write', 'admin_teacher_excuses') ? (
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
                    placeholder={t('TeacherExcuseSearch') as string}
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
                {ability.can('write', 'admin_teacher_excuses') ? (
                  <Grid item xs={12} sm={12} md={3} lg={3}>
                    <Button
                      sx={{ mb: 2 }}
                      component={Link}
                      variant='contained'
                      fullWidth
                      href='/teacher-excuses/create'
                      startIcon={<Icon icon='tabler:plus' />}
                    >
                      <Translations text='AddExcuse' />
                    </Button>
                  </Grid>
                ) : null}
              </Grid>
            </CardContent>

            <Divider sx={{ my: '0 !important' }} />

            <TableHeader
              reason={reason}
              school={school}
              teacher={teacher}
              date={date}
              handleFilterReason={handleFilterReason}
              handleFilterSchool={handleFilterSchool}
              handleFilterTeacher={handleFilterTeacher}
              handleFilterDate={handleFilterDate}
            />
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

TeacherExcusesList.acl = {
  action: 'read',
  subject: 'admin_teacher_excuses'
}

export default TeacherExcusesList
