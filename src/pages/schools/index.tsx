// ** React Imports
import { useState, useEffect, SyntheticEvent, useContext, useMemo, useRef } from 'react'

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
import { InputAdornment, Autocomplete, TextField, ListItemText, Divider } from '@mui/material'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import { deleteSchool, fetchSchools } from 'src/features/store/apps/school'
import { fetchRegions } from 'src/features/store/apps/regions'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Types Imports
import { RootState, AppDispatch } from 'src/features/store'
import { SchoolListType, SchoolType } from 'src/entities/school/SchoolType'

// ** Utils Import
import { renderPhone } from 'src/features/utils/ui/renderPhone'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'

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
import { renderSchoolLevel } from 'src/features/utils/ui/renderSchoolLevel'
import TableHeader from 'src/widgets/schools/list/TableHeader'

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

const validateBoolParam = (bool: string | null) => {
  if (bool) {
    if (bool === '1' || bool === '0') {
      return bool
    } else {
      return null
    }
  } else {
    return null
  }
}

const SchoolsList = () => {
  // ** State
  const [isFiltered, setIsFiltered] = useState<boolean>(false)
  const [isPageChanged, setIsPageChanged] = useState<boolean>(false)
  const [isSecondarySchool, setIsSecondarySchool] = useState<boolean>(true)
  const [loadingQueries, setLoadingQueries] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [regions, setRegions] = useState<any | null>([])
  const [region, setRegion] = useState<SchoolListType | null>(null)
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
  const { schoolsParams, setSearchParams } = useContext(ParamsContext)
  const { schools_list } = useSelector((state: RootState) => state.schools)
  const { region_list } = useSelector((state: RootState) => state.regions)

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
      const parent_id = validateIdParam(searchParams.get('parent_id'))
      const is_secondary_school = validateBoolParam(searchParams.get('is_secondary_school'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (schoolsParams.search) {
        paramsToRedirect.search = schoolsParams.search
        setSearchValue(validateSearchParam(schoolsParams.search as string))
      }

      if (parent_id) {
        paramsToSet.parent_id = parent_id
        setRegion(regions.find((region: SchoolListType) => region.id === parent_id) || null)
      } else if (schoolsParams.parent_id) {
        paramsToRedirect.parent_id = schoolsParams.parent_id
        setRegion(regions.find((region: SchoolListType) => region.id === (schoolsParams.parent_id as string)) || null)
      }

      if (is_secondary_school) {
        paramsToSet.is_secondary_school = is_secondary_school
        if (is_secondary_school === '1') {
          setIsSecondarySchool(true)
        } else if (is_secondary_school === '0') {
          setIsSecondarySchool(false)
        }
      } else if (schoolsParams.is_secondary_school) {
        paramsToRedirect.is_secondary_school = schoolsParams.is_secondary_school
        if (schoolsParams.is_secondary_school === '1') {
          setIsSecondarySchool(true)
        } else if (schoolsParams.is_secondary_school === '0') {
          setIsSecondarySchool(false)
        }
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (schoolsParams.page) {
          paramsToRedirect.page = schoolsParams.page
          setPagination({ pageIndex: parseInt(schoolsParams.page as string), pageSize: 12 })
        } else if (page === null && !schoolsParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('schoolsParams', paramsToSet)
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
  }, [regions, router])

  useEffect(() => {
    const arr: SchoolListType[] = []
    Object.values(region_list.data).map((wel: any[]) => wel.map((etr: SchoolListType) => arr.push(etr)))
    setRegions(arr)
  }, [region_list.data])

  useEffect(() => {
    dispatch(fetchRegions())
  }, [dispatch])

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
      if (region !== null) {
        urlParams['parent_id'] = region.id
      }
      if (isSecondarySchool !== null) {
        urlParams['is_secondary_school'] = isSecondarySchool
      }
      if (sorting.length !== 0) {
        urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
      }
      const timeoutId = setTimeout(() => {
        dispatch(fetchSchools(urlParams))
      }, 400)

      return () => clearTimeout(timeoutId)
    }
  }, [dispatch, searchValue, region, sorting, pagination, loadingQueries, isSecondarySchool])

  useEffect(() => {
    if (!searchValue && region === null) {
      setIsFiltered(false)
    } else {
      setIsFiltered(true)
    }
  }, [searchValue, region])

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
    setRegion(null)
    setIsSecondarySchool(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '0')
    params.set('is_secondary_school', '1')
    params.delete('search')
    params.delete('parent_id')
    const contextParams = schoolsParams
    delete contextParams.search
    delete contextParams.parent_id
    setSearchParams('schoolsParams', contextParams)
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilter = (event: SyntheticEvent | null, newValue: SchoolListType | null) => {
    setRegion(newValue)
    const params = new URLSearchParams(searchParams.toString())
    if (newValue) {
      params.set('parent_id', newValue.id.toString())
    } else {
      params.delete('parent_id')
      const contextParams = delete schoolsParams.parent_id
      setSearchParams('schoolsParams', contextParams)
    }
    params.set('page', '0')
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
      const contextParams = delete schoolsParams.search
      setSearchParams('schoolsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterSecondarySchool = (val: boolean) => {
    setIsSecondarySchool(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('is_secondary_school')

    const contextParams = delete schoolsParams.is_secondary_school
    setSearchParams('schoolsParams', contextParams)

    params.set('is_secondary_school', val === true ? '1' : '0')

    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleShowDialog = async (arr?: string[]) => {
    const confirmed = await showDialog()
    if (confirmed) {
      if (arr) {
        handleDeleteSchool(arr)
      } else {
        handleDeleteSchool(Object.keys(rowSelection))
        setRowSelection({})
      }
    } else {
      setRowSelection({})
    }
  }

  const handleDeleteSchool = async (arr: string[]) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteSchool(arr))
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
        if (region !== null) {
          urlParams['parent_id'] = region.id
        }
        if (isSecondarySchool !== null) {
          urlParams['is_secondary_school'] = isSecondarySchool
        }
        if (sorting.length !== 0) {
          urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
        }
        if (urlParams['search']) {
          const timeoutId = setTimeout(() => {
            dispatch(fetchSchools(urlParams))
          }, 400)

          return () => clearTimeout(timeoutId)
        } else {
          dispatch(fetchSchools(urlParams))
        }
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const columns = useMemo<MRT_ColumnDef<SchoolType>[]>(
    () => [
      {
        accessorKey: 'code',
        accessorFn: row => row.code,
        id: 'code',
        size: 60,
        header: t('Code'),
        Cell: ({ row }) => <Typography>{row.original.code}</Typography>
      },
      {
        accessorKey: 'name',
        accessorFn: row => row.name,
        id: 'name',
        header: `${t('School')} / ${t('Region')}`,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography>{row.original.name}</Typography>
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              {row.original.parent?.name}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'principal',
        accessorFn: row => row.admin?.last_name,
        id: 'principal',
        header: t('PrincipalAndPhone'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              component={Link}
              href={`/users/view/${row.original.admin?.id}`}
              color={'primary.main'}
              sx={{ fontWeight: '600', textDecoration: 'none' }}
            >
              {renderUserFullname(
                row.original.admin?.last_name,
                row.original.admin?.first_name,
                row.original.admin?.middle_name
              )}
            </Typography>
            <Typography variant='body2'>{renderPhone(row.original.admin?.phone)}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'classrooms_count',
        accessorFn: row => row.classrooms_count,
        id: 'classrooms_count',
        header: t('ClassroomsCount'),
        Cell: ({ row }) => <Typography>{row.original.classrooms_count}</Typography>
      },
      {
        accessorKey: 'specialist',
        accessorFn: row => row.specialist?.last_name,
        id: 'specialist',
        header: t('Specialist'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              component={Link}
              href={`/users/view/${row.original.specialist?.id}`}
              color={'primary.main'}
              sx={{ fontWeight: '600', textDecoration: 'none' }}
            >
              {renderUserFullname(
                row.original.specialist?.last_name,
                row.original.specialist?.first_name,
                row.original.specialist?.middle_name
              )}
            </Typography>
            <Typography variant='body2'>{renderPhone(row.original.specialist?.phone)}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'phone',
        accessorFn: row => row.phone,
        id: 'phone',
        header: t('Phone'),
        Cell: ({ row }) => <Typography>{renderPhone(row.original.phone)}</Typography>
      },
      {
        accessorKey: 'level',
        accessorFn: row => row.level,
        id: 'level',
        header: t('Level'),
        Cell: ({ row }) => <Typography>{renderSchoolLevel(row.original.level)}</Typography>
      },
      {
        accessorKey: 'email',
        accessorFn: row => row.email,
        id: 'email',
        header: t('Email'),
        Cell: ({ row }) => <Typography>{row.original.email}</Typography>
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
    data: schools_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: schools_list.error
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
        <Translations text='Total' /> {schools_list.total}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/schools/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
        {ability?.can('write', 'admin_schools') ? (
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
    rowCount: schools_list.total,
    initialState: {
      columnVisibility: { level: false, email: false, phone: false }
    },
    state: {
      density: 'compact',
      isLoading: schools_list.loading || loadingQueries,
      pagination,
      rowSelection,
      sorting
    }
  })

  if (schools_list.error) {
    return <Error error={schools_list.error} />
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
                  {ability.can('write', 'admin_schools') ? (
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
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <CustomTextField
                    fullWidth
                    value={searchValue}
                    ref={searchInputRef}
                    placeholder={t('SchoolSearch') as string}
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
                  <Autocomplete
                    id='region-filter'
                    fullWidth
                    size='small'
                    noOptionsText={t('NoRows')}
                    value={region}
                    options={regions}
                    onChange={handleFilter}
                    loading={region_list.loading}
                    loadingText={t('ApiLoading')}
                    getOptionLabel={option => option.name || ''}
                    renderOption={(props, item) => (
                      <li {...props} key={item.id}>
                        <ListItemText>{item.name}</ListItemText>
                      </li>
                    )}
                    renderInput={params => <TextField {...params} label={t('Region')} />}
                  />
                </Grid>
                {ability.can('write', 'admin_schools') ? (
                  <Grid item xs={12} sm={12} md={3} lg={3}>
                    <Button
                      sx={{ mb: 2 }}
                      component={Link}
                      variant='contained'
                      fullWidth
                      href='/schools/create'
                      startIcon={<Icon icon='tabler:plus' />}
                    >
                      <Translations text='AddSchool' />
                    </Button>
                  </Grid>
                ) : null}
              </Grid>
            </CardContent>

            <Divider sx={{ my: '0 !important' }} />

            <TableHeader
              isSecondarySchool={isSecondarySchool}
              handleFilterSecondarySchool={handleFilterSecondarySchool}
            />
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

SchoolsList.acl = {
  action: 'read',
  subject: 'admin_schools'
}

export default SchoolsList
