// ** React Imports
import { useState, useEffect, useContext, useMemo, useRef } from 'react'

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
import { deleteClassroom, fetchClassrooms } from 'src/features/store/apps/classrooms'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Types Imports
import { RootState, AppDispatch } from 'src/features/store'
import { ClassroomType } from 'src/entities/classroom/ClassroomType'

// ** Utils Import
import { renderPhone } from 'src/features/utils/ui/renderPhone'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'

// ** Custom Components Imports
import CustomTextField from 'src/shared/components/mui/text-field'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { useTranslation } from 'react-i18next'
import { useDialog } from 'src/app/context/DialogContext'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import Error from 'src/widgets/general/Error'
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
import { ParamsContext } from 'src/app/context/ParamsContext'
import Translations from 'src/app/layouts/components/Translations'
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
import { renderLangType } from 'src/features/utils/ui/renderLangType'
import { renderClassroomLevel } from 'src/features/utils/ui/renderClassroomLevel'
import ClassroomsTableHeader from './ClassroomsTableHeader'

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

const ClassroomsList = () => {
  // ** State
  const [isFiltered, setIsFiltered] = useState<boolean>(false)
  const [isPageChanged, setIsPageChanged] = useState<boolean>(false)
  const [loadingQueries, setLoadingQueries] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [examsCount, setExamsCount] = useState<number[] | null>(null)
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
  const { classroomsParams, setSearchParams } = useContext(ParamsContext)
  const { classrooms_list } = useSelector((state: RootState) => state.classrooms)

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
      const exams_count = validateIdsParam(searchParams.getAll('exams_count'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (classroomsParams.search) {
        paramsToRedirect.search = classroomsParams.search
        setSearchValue(validateSearchParam(classroomsParams.search as string))
      }

      if (exams_count) {
        paramsToSet.exams_count = exams_count
        if (exams_count.length === 1 || exams_count.length === 2) {
          setExamsCount(exams_count.map(v => parseInt(v)).sort())
        }
      } else if (classroomsParams.exams_count) {
        paramsToRedirect.exams_count = classroomsParams.exams_count
        if (classroomsParams.exams_count.length === 1 || classroomsParams.exams_count.length === 2) {
          setExamsCount((classroomsParams.exams_count as string[]).map(v => parseInt(v)).sort())
        }
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (classroomsParams.page) {
          paramsToRedirect.page = classroomsParams.page
          setPagination({ pageIndex: parseInt(classroomsParams.page as string), pageSize: 12 })
        } else if (page === null && !classroomsParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('classroomsParams', paramsToSet)
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
      if (examsCount?.length !== 0) {
        urlParams['exams_count_between[]'] = examsCount
      }
      if (sorting.length !== 0) {
        urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
      }
      const timeoutId = setTimeout(() => {
        dispatch(fetchClassrooms(urlParams))
      }, 400)

      return () => clearTimeout(timeoutId)
    }
  }, [dispatch, searchValue, sorting, pagination, loadingQueries, examsCount])

  useEffect(() => {
    if (!searchValue && !examsCount) {
      setIsFiltered(false)
    } else {
      setIsFiltered(true)
    }
  }, [searchValue, examsCount])

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
    setExamsCount(null)
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '0')
    params.delete('search')
    params.delete('exams_count')
    const contextParams = classroomsParams
    delete contextParams.search
    delete contextParams.exams_count
    setSearchParams('classroomsParams', contextParams)
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
      const contextParams = delete classroomsParams.search
      setSearchParams('classroomsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterExamsCount = (val: string | null) => {
    const arr = val && val.split('-').map(Number)
    setExamsCount(arr ? arr : null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('exams_count')
    const contextParams = delete classroomsParams.lesson_hours
    setSearchParams('classroomsParams', contextParams)
    if (arr && arr.length > 0) {
      arr.map((hour: number) => {
        params.append('exams_count', hour.toString())
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
        handleDeleteClassroom(arr)
      } else {
        handleDeleteClassroom(Object.keys(rowSelection))
        setRowSelection({})
      }
    } else {
      setRowSelection({})
    }
  }

  const handleDeleteClassroom = async (arr: string[]) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteClassroom(arr))
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
        if (examsCount?.length !== 0) {
          urlParams['exams_count_between[]'] = examsCount
        }
        if (sorting.length !== 0) {
          urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
        }
        if (urlParams['search']) {
          const timeoutId = setTimeout(() => {
            dispatch(fetchClassrooms(urlParams))
          }, 400)

          return () => clearTimeout(timeoutId)
        } else {
          dispatch(fetchClassrooms(urlParams))
        }
        setSearchValue(null)
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const columns = useMemo<MRT_ColumnDef<ClassroomType>[]>(
    () => [
      {
        accessorKey: 'name',
        accessorFn: row => row.name,
        id: 'name',
        header: t('Name'),
        Cell: ({ row }) => <Typography>{row.original.name}</Typography>
      },
      {
        accessorKey: 'students_count',
        accessorFn: row => row.students_count,
        id: 'students_count',
        header: t('StudentsCount'),
        Cell: ({ row }) => <Typography>{row.original.students_count}</Typography>
      },
      {
        accessorKey: 'teacher',
        accessorFn: row => row.teacher?.last_name,
        id: 'teacher',
        header: t('HeadTeacher'),
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
            <Typography variant='body2'>{renderPhone(row.original.teacher?.phone)}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'period',
        accessorFn: row => row.period?.title,
        id: 'period',
        header: t('Period'),
        Cell: ({ row }) => <Typography>{row.original.period?.title}</Typography>
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
      },
      {
        accessorKey: 'head_student',
        accessorFn: row => row.student?.last_name,
        id: 'head_student',
        header: t('HeadStudent'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              component={Link}
              href={`/users/view/${row.original.student?.id}`}
              color={'primary.main'}
              sx={{ fontWeight: '600', textDecoration: 'none' }}
            >
              {renderUserFullname(
                row.original.student?.last_name,
                row.original.student?.first_name,
                row.original.student?.middle_name
              )}
            </Typography>
            <Typography variant='body2'>{renderPhone(row.original.student?.phone)}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'language',
        accessorFn: row => row.language,
        id: 'language',
        header: t('ClassroomLangType'),
        Cell: ({ row }) => <Typography>{renderLangType(row.original.language)}</Typography>
      },
      {
        accessorKey: 'level',
        accessorFn: row => row.level,
        id: 'level',
        header: t('Level'),
        Cell: ({ row }) => <Typography>{renderClassroomLevel(row.original.level)}</Typography>
      },
      {
        accessorKey: 'sub_group_count',
        accessorFn: row => row.sub_groups?.length,
        id: 'sub_group_count',
        header: t('Subgroups'),
        Cell: ({ row }) => <Typography>{row.original.sub_groups?.length}</Typography>
      },
      {
        accessorKey: 'week_hours',
        accessorFn: row => row.subjects && row.subjects.reduce((acc, obj) => acc + obj.week_hours, 0),
        id: 'week_hours',
        header: t('LessonHours'),
        Cell: ({ row }) => (
          <Typography>
            {row.original.subjects && row.original.subjects.reduce((acc, obj) => acc + obj.week_hours, 0)}
          </Typography>
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
    data: classrooms_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: classrooms_list.error
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
        <Translations text='Total' /> {classrooms_list.total}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/classrooms/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
        {ability?.can('write', 'admin_classrooms') ? (
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
    rowCount: classrooms_list.total,
    initialState: {
      columnVisibility: {
        head_student: false,
        language: false,
        level: false,
        sub_group_count: false,
        week_hours: false
      }
    },
    state: {
      density: 'compact',
      isLoading: classrooms_list.loading || loadingQueries,
      pagination,
      rowSelection,
      sorting
    }
  })

  if (classrooms_list.error) {
    return <Error error={classrooms_list.error} />
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
                  {ability.can('write', 'admin_classrooms') ? (
                    <Button
                      fullWidth
                      color='error'
                      variant='contained'
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
                    placeholder={t('ClassroomSearch') as string}
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
                {ability.can('write', 'admin_classrooms') ? (
                  <Grid item xs={12} sm={12} md={3} lg={3}>
                    <Button
                      sx={{ mb: 2 }}
                      component={Link}
                      variant='contained'
                      fullWidth
                      href='/classrooms/create'
                      startIcon={<Icon icon='tabler:plus' />}
                    >
                      <Translations text='AddClassroom' />
                    </Button>
                  </Grid>
                ) : null}
              </Grid>
            </CardContent>

            <Divider sx={{ my: '0 !important' }} />

            <ClassroomsTableHeader examsCount={examsCount} handleFilterExamsCount={handleFilterExamsCount} />
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default ClassroomsList