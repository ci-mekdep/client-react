// ** React Imports
import { useState, useEffect, useContext, useMemo, useRef } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { Button, InputAdornment } from '@mui/material'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Types Imports
import { RootState, AppDispatch } from 'src/features/store'

// ** Utils Import

// ** Custom Components Imports
import CustomTextField from 'src/shared/components/mui/text-field'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import { useDialog } from 'src/app/context/DialogContext'
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
import { deleteBaseSubject, fetchBaseSubjects } from 'src/features/store/apps/baseSubjects'
import { BaseSubjectType } from 'src/entities/classroom/BaseSubjectType'
import { renderAgeCategory } from 'src/features/utils/ui/renderAgeCategory'
import { renderPrice } from 'src/features/utils/ui/renderPrice'
import CustomChip from 'src/shared/components/mui/chip'

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

const BaseSubjectsList = () => {
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
  const { baseSubjectsParams, setSearchParams } = useContext(ParamsContext)
  const { base_subjects_list } = useSelector((state: RootState) => state.baseSubjects)

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
      } else if (baseSubjectsParams.search) {
        paramsToRedirect.search = baseSubjectsParams.search
        setSearchValue(validateSearchParam(baseSubjectsParams.search as string))
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (baseSubjectsParams.page) {
          paramsToRedirect.page = baseSubjectsParams.page
          setPagination({ pageIndex: parseInt(baseSubjectsParams.page as string), pageSize: 12 })
        } else if (page === null && !baseSubjectsParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('baseSubjectsParams', paramsToSet)
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
        dispatch(fetchBaseSubjects(urlParams))
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
    const contextParams = baseSubjectsParams
    delete contextParams.search
    setSearchParams('baseSubjectsParams', contextParams)
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
      const contextParams = delete baseSubjectsParams.search
      setSearchParams('baseSubjectsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleShowDialog = async (arr?: string[]) => {
    const confirmed = await showDialog()
    if (confirmed) {
      if (arr) {
        handleDeleteBaseSubject(arr)
      } else {
        handleDeleteBaseSubject(Object.keys(rowSelection))
        setRowSelection({})
      }
    } else {
      setRowSelection({})
    }
  }

  const handleDeleteBaseSubject = async (arr: string[]) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteBaseSubject(arr))
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
            dispatch(fetchBaseSubjects(urlParams))
          }, 400)

          return () => clearTimeout(timeoutId)
        } else {
          dispatch(fetchBaseSubjects(urlParams))
        }
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const columns = useMemo<MRT_ColumnDef<BaseSubjectType>[]>(
    () => [
      {
        accessorKey: 'name',
        accessorFn: row => row.name,
        id: 'name',
        header: t('Name'),
        Cell: ({ row }) => (
          <Box>
            <Typography>{row.original.name}</Typography>
            <CustomChip
              rounded
              size='small'
              label={row.original.is_available ? t('Available') : t('NotAvailable')}
              skin='light'
              color={row.original.is_available ? 'success' : 'error'}
            />
          </Box>
        )
      },
      {
        accessorKey: 'price',
        accessorFn: row => row.price,
        id: 'price',
        header: t('Price'),
        Cell: ({ row }) => <Typography>{renderPrice(row.original.price)}</Typography>
      },
      {
        accessorKey: 'exam_min_grade',
        accessorFn: row => row.exam_min_grade,
        id: 'exam_min_grade',
        header: t('ExamMinGrade'),
        Cell: ({ row }) => <Typography>{row.original.exam_min_grade}</Typography>
      },
      {
        accessorKey: 'category',
        accessorFn: row => row.category,
        id: 'category',
        header: t('Category'),
        Cell: ({ row }) => <Typography>{row.original.category}</Typography>
      },
      {
        accessorKey: 'school',
        accessorFn: row => row.school?.name,
        id: 'school',
        header: t('EduCenter'),
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
        accessorKey: 'age_category',
        accessorFn: row => row.age_category,
        id: 'age_category',
        header: t('AgeCategory'),
        Cell: ({ row }) => <Typography>{renderAgeCategory(row.original.age_category)}</Typography>
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
    data: base_subjects_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: base_subjects_list.error
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
        <Translations text='Total' /> {base_subjects_list.total}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/base-subjects/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
        {ability?.can('write', 'admin_subjects') ? (
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
    rowCount: base_subjects_list.total,
    initialState: {
      columnVisibility: { age_category: false }
    },
    state: {
      density: 'compact',
      isLoading: base_subjects_list.loading || loadingQueries,
      pagination,
      rowSelection,
      sorting
    }
  })

  if (base_subjects_list.error) {
    return <Error error={base_subjects_list.error} />
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
                  {ability.can('write', 'admin_subjects') ? (
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
                    placeholder={t('CourseSearch') as string}
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
                {ability.can('write', 'admin_subjects') ? (
                  <Grid item xs={12} sm={12} md={3} lg={3}>
                    <Button
                      sx={{ mb: 2 }}
                      component={Link}
                      variant='contained'
                      fullWidth
                      href='/base-subjects/create'
                      startIcon={<Icon icon='tabler:plus' />}
                    >
                      <Translations text='AddCourse' />
                    </Button>
                  </Grid>
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

BaseSubjectsList.acl = {
  action: 'read',
  subject: 'admin_subjects'
}

export default BaseSubjectsList
