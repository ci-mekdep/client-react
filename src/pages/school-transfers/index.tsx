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
import { Button, ButtonGroup, Divider, InputAdornment } from '@mui/material'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Third Party Imports

// ** Types Imports
import { RootState, AppDispatch } from 'src/features/store'

// ** Utils Import
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'

// ** Custom Components Imports
import CustomTextField from 'src/shared/components/mui/text-field'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
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
import { SchoolTransferType } from 'src/entities/app/SchoolTransferType'
import CustomChip from 'src/shared/components/mui/chip'
import i18n from 'i18next'
import { fetchSchoolTransfers } from 'src/features/store/apps/schoolTransfers'

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

const renderStatusChip = (val: string | null) => {
  if (val === 'waiting') {
    return <CustomChip skin='light' size='small' rounded label={i18n.t('StatusWaiting') as string} color='warning' />
  } else if (val === 'accepted') {
    return <CustomChip skin='light' size='small' rounded label={i18n.t('StatusAccepted') as string} color='success' />
  } else if (val === 'rejected') {
    return <CustomChip skin='light' size='small' rounded label={i18n.t('StatusRejected') as string} color='error' />
  }
}

const SchoolTransfersList = () => {
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
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { schoolTransfersParams, setSearchParams } = useContext(ParamsContext)
  const { school_transfers_list } = useSelector((state: RootState) => state.schoolTransfers)

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
      const page = validatePageParam(searchParams.get('page'))
      const searchQuery = validateSearchParam(searchParams.get('search'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (schoolTransfersParams.search) {
        paramsToRedirect.search = schoolTransfersParams.search
        setSearchValue(validateSearchParam(schoolTransfersParams.search as string))
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (schoolTransfersParams.page) {
          paramsToRedirect.page = schoolTransfersParams.page
          setPagination({ pageIndex: parseInt(schoolTransfersParams.page as string), pageSize: 12 })
        } else if (page === null && !schoolTransfersParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('schoolTransfersParams', paramsToSet)
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
        dispatch(fetchSchoolTransfers(urlParams))
      }, 400)

      return () => clearTimeout(timeoutId)
    }
  }, [dispatch, searchValue, pagination, sorting, loadingQueries])

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
    const contextParams = schoolTransfersParams
    delete contextParams.search
    setSearchParams('schoolTransfersParams', contextParams)
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
      const contextParams = delete schoolTransfersParams.search
      setSearchParams('schoolTransfersParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const columns = useMemo<MRT_ColumnDef<SchoolTransferType>[]>(
    () => [
      {
        accessorKey: 'student',
        accessorFn: row => row.student?.last_name,
        id: 'student',
        header: t('RoleStudent'),
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
          </Box>
        )
      },
      {
        accessorKey: 'source_classroom',
        accessorFn: row => row.source_classroom?.name,
        id: 'source_classroom',
        header: t('SourceClassroom'),
        Cell: ({ row }) => (
          <Typography
            component={Link}
            href={`/classrooms/view/${row.original.source_classroom?.id}`}
            color={'primary.main'}
            sx={{ fontWeight: '600', textDecoration: 'none' }}
          >
            {row.original.source_classroom?.name}
          </Typography>
        )
      },
      {
        accessorKey: 'target_school',
        accessorFn: row => row.target_school?.name,
        id: 'target_school',
        header: t('TargetSchool'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography>{row.original.target_school?.name}</Typography>
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              {row.original.target_school?.parent?.name}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'status',
        accessorFn: row => row.status,
        id: 'status',
        header: t('Status'),
        Cell: ({ row }) => renderStatusChip(row.original.status)
      },
      {
        accessorKey: 'sender_note',
        accessorFn: row => row.sender_note,
        id: 'sender_note',
        header: t('SenderNote'),
        Cell: ({ row }) => <Typography>{row.original.sender_note}</Typography>
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
    data: school_transfers_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: school_transfers_list.error
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
        <Translations text='Total' /> {school_transfers_list.total}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/school-transfers/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
      </Box>
    ),
    rowCount: school_transfers_list.total,
    initialState: {
      columnVisibility: {
        second_teacher: false,
        exam_teacher: false,
        exam_start_time: false
      }
    },
    state: {
      density: 'compact',
      isLoading: school_transfers_list.loading || loadingQueries,
      pagination,
      rowSelection,
      sorting
    }
  })

  if (school_transfers_list.error) {
    return <Error error={school_transfers_list.error} />
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
                  {ability.can('write', 'admin_school_transfers') ? (
                    <Button
                      sx={{ mb: 2 }}
                      component={Link}
                      variant='contained'
                      fullWidth
                      href='/school-transfers/create'
                      startIcon={<Icon icon='tabler:plus' />}
                    >
                      <Translations text='AddSchoolTransfer' />
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
                <Grid item xs={12} sm={12} md={8} lg={8} xl={8}>
                  <CustomTextField
                    fullWidth
                    value={searchValue}
                    ref={searchInputRef}
                    placeholder={t('SchoolTransfersSearch') as string}
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
                <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                  <ButtonGroup variant='outlined' fullWidth>
                    <Button variant='contained'>
                      <Translations text='OutboxSchoolTransfers' />
                    </Button>
                    <Button variant='outlined' onClick={() => router.push('/school-transfers/inbox')}>
                      <Translations text='InboxSchoolTransfers' />
                    </Button>
                  </ButtonGroup>
                </Grid>
              </Grid>
            </CardContent>

            <Divider sx={{ my: '0 !important' }} />
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

SchoolTransfersList.acl = {
  action: 'read',
  subject: 'admin_school_transfers'
}

export default SchoolTransfersList
