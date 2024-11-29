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
import TableHeader from 'src/widgets/teacher-excuses/teacher/TableHeader'
import { useRouter } from 'next/router'
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
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { renderTeacherExcuseReason } from 'src/features/utils/ui/renderTeacherExcuseReason'
import format from 'date-fns/format'
import CustomChip from 'src/shared/components/mui/chip'
import differenceInDays from 'date-fns/differenceInDays'

const TeacherExcusesList = () => {
  // ** State
  const [isFiltered, setIsFiltered] = useState<boolean>(false)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 12
  })

  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [reason, setReason] = useState<string>('')
  const [date, setDate] = useState<string | null>(null)

  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // ** Hooks
  const router = useRouter()
  const showDialog = useDialog()
  const { t } = useTranslation()
  const teacherId = router.query.teacherId
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
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
    if (teacherId !== undefined) {
      const urlParams: any = {
        is_list: true,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        teacher_id: teacherId
      }
      if (searchValue !== '') {
        urlParams['search'] = searchValue
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
  }, [dispatch, teacherId, pagination, reason, searchValue, sorting, date])

  useEffect(() => {
    dispatch(
      fetchSchoolsLite({
        limit: 750,
        offset: 0,
        is_select: true
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (!searchValue && reason === '' && !date) {
      setIsFiltered(false)
    } else {
      setIsFiltered(true)
    }
  }, [searchValue, reason, date])

  const clearFilters = () => {
    setSearchValue('')
    setReason('')
    setDate(null)
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleSearchValue = (val: string) => {
    setSearchValue(val)
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterReason = (val: string | null) => {
    if (val) {
      setReason(val)
    } else setReason('')
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterDate = (val: string | null) => {
    setDate(val)
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
          offset: pagination.pageIndex * pagination.pageSize,
          teacher_id: teacherId
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
      isLoading: teacher_excuses_list.loading,
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
              date={date}
              handleFilterReason={handleFilterReason}
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
