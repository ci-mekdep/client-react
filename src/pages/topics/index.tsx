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
import {
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
import { TopicType } from 'src/entities/journal/TopicType'
import { deleteTopic, fetchTopics } from 'src/features/store/apps/topics'
import TableHeader from 'src/widgets/topics/list/TableHeader'
import { SubjectSettingsType } from 'src/entities/classroom/SubjectType'
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
import { ParamsContext } from 'src/app/context/ParamsContext'
import { fetchSettings } from 'src/features/store/apps/settings'
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
import { renderLangType } from 'src/features/utils/ui/renderLangType'

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

const validateLevelParam = (level: string | null) => {
  if (level && level !== '') {
    if (level === 'Adaty' || level === 'Ýörite' || level === 'Hünär') {
      return level
    } else {
      return null
    }
  }
}

const validatePeriodParam = (period: string | null) => {
  if (period && period !== '') {
    if (period === '1' || period === '2' || period === '3' || period === '4') {
      return period
    } else {
      return null
    }
  }
}

const validateClassyearParam = (classyear: string | null) => {
  if (classyear && classyear !== '') {
    if (
      classyear === '1' ||
      classyear === '2' ||
      classyear === '3' ||
      classyear === '4' ||
      classyear === '5' ||
      classyear === '6' ||
      classyear === '7' ||
      classyear === '8' ||
      classyear === '9' ||
      classyear === '10' ||
      classyear === '11' ||
      classyear === '12'
    ) {
      return classyear
    } else {
      return null
    }
  }
}

const TopicsList = () => {
  // ** State
  const [isFiltered, setIsFiltered] = useState<boolean>(false)
  const [isPageChanged, setIsPageChanged] = useState<boolean>(false)
  const [loadingQueries, setLoadingQueries] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [level, setLevel] = useState<string>('')
  const [period, setPeriod] = useState<string>('')
  const [classyear, setClassyear] = useState<string>('')
  const [subject, setSubject] = useState<SubjectSettingsType | null>(null)

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
  const searchParams = useSearchParams()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { topicsParams, setSearchParams } = useContext(ParamsContext)
  const { topics_list } = useSelector((state: RootState) => state.topics)
  const { settings } = useSelector((state: RootState) => state.settings)

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
    if (router.isReady && !settings.loading && settings.data && settings.data.subject?.subjects) {
      const searchQuery = validateSearchParam(searchParams.get('search'))
      const page = validatePageParam(searchParams.get('page'))
      const level = validateLevelParam(searchParams.get('level'))
      const period_number = validatePeriodParam(searchParams.get('period_number'))
      const classyear = validateClassyearParam(searchParams.get('classyear'))
      const subject_name = validateSearchParam(searchParams.get('subject'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (topicsParams.search) {
        paramsToRedirect.search = topicsParams.search
        setSearchValue(validateSearchParam(topicsParams.search as string))
      }

      if (level) {
        paramsToSet.level = level
        setLevel(level)
      } else if (topicsParams.level) {
        paramsToRedirect.level = topicsParams.level
        setLevel(validateLevelParam(topicsParams.level as string) || '')
      }

      if (period_number) {
        paramsToSet.period_number = period_number
        setPeriod(period_number)
      } else if (topicsParams.period_number) {
        paramsToRedirect.period_number = topicsParams.period_number
        setPeriod(validatePeriodParam(topicsParams.period_number as string) || '')
      }

      if (classyear) {
        paramsToSet.classyear = classyear
        setClassyear(classyear)
      } else if (topicsParams.classyear) {
        paramsToRedirect.classyear = topicsParams.classyear
        setClassyear(validateClassyearParam(topicsParams.classyear as string) || '')
      }

      if (subject_name) {
        paramsToSet.subject = subject_name
        setSubject(
          settings.data.subject.subjects.find((subject: SubjectSettingsType) => subject.name === subject_name) || null
        )
      } else if (topicsParams.subject) {
        paramsToRedirect.subject = topicsParams.subject
        setSubject(
          settings.data.subject.subjects.find(
            (subject: SubjectSettingsType) => subject.name === topicsParams.subject
          ) || null
        )
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (topicsParams.page) {
          paramsToRedirect.page = topicsParams.page
          setPagination({ pageIndex: parseInt(topicsParams.page as string), pageSize: 12 })
        } else if (page === null && !topicsParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('topicsParams', paramsToSet)
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
  }, [router, settings])

  useEffect(() => {
    dispatch(fetchSettings({}))
  }, [dispatch])

  useEffect(() => {
    if (loadingQueries === false) {
      const urlParams: any = {
        is_list: true,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize
      }
      if (classyear) {
        urlParams['classyear'] = classyear
      }
      if (subject) {
        urlParams['subject'] = subject.name
      }
      if (level) {
        urlParams['level'] = level
      }
      if (period) {
        urlParams['period_number'] = period
      }
      if (searchValue !== '') {
        urlParams['search'] = searchValue
      }
      if (sorting.length !== 0) {
        urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
      }
      const timeoutId = setTimeout(() => {
        dispatch(fetchTopics(urlParams))
      }, 400)

      return () => clearTimeout(timeoutId)
    }
  }, [dispatch, searchValue, pagination, classyear, subject, level, period, loadingQueries, sorting])

  useEffect(() => {
    if (!searchValue && !level && !period && !classyear && subject === null) {
      setIsFiltered(false)
    } else {
      setIsFiltered(true)
    }
  }, [classyear, level, period, searchValue, subject])

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
    setLevel('')
    setPeriod('')
    setClassyear('')
    setSubject(null)
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '0')
    params.delete('search')
    params.delete('level')
    params.delete('period_number')
    params.delete('classyear')
    params.delete('subject')
    const contextParams = topicsParams
    delete contextParams.search
    delete contextParams.level
    delete contextParams.period_number
    delete contextParams.classyear
    delete contextParams.subject
    setSearchParams('topicsParams', contextParams)
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
      const contextParams = delete topicsParams.search
      setSearchParams('topicsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterLevel = (val: string | null) => {
    if (val) {
      setLevel(val)
    } else setLevel('')
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('level', val)
    } else {
      params.delete('level')
      const contextParams = delete topicsParams.level
      setSearchParams('topicsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterPeriod = (val: string | null) => {
    if (val) {
      setPeriod(val)
    } else setPeriod('')
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('period_number', val)
    } else {
      params.delete('period_number')
      const contextParams = delete topicsParams.period_number
      setSearchParams('topicsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterClassyear = (val: string | null) => {
    if (val) {
      setClassyear(val)
    } else setClassyear('')
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('classyear', val)
    } else {
      params.delete('classyear')
      const contextParams = delete topicsParams.classyear
      setSearchParams('topicsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterSubject = (val: SubjectSettingsType | null) => {
    setSubject(val)
    const params = new URLSearchParams(searchParams.toString())
    if (val) {
      params.set('subject', val.name)
    } else {
      params.delete('subject')
      const contextParams = delete topicsParams.subject
      setSearchParams('topicsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleShowDialog = async (arr?: string[]) => {
    const confirmed = await showDialog()
    if (confirmed) {
      if (arr) {
        handleDeleteTopic(arr)
      } else {
        handleDeleteTopic(Object.keys(rowSelection))
        setRowSelection({})
      }
    } else {
      setRowSelection({})
    }
  }

  const handleDeleteTopic = async (arr: string[]) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteTopic(arr))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        const urlParams: any = {
          is_list: true,
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize
        }
        if (classyear) {
          urlParams['classyear'] = classyear
        }
        if (subject) {
          urlParams['subject'] = subject.name
        }
        if (level) {
          urlParams['level'] = level
        }
        if (period) {
          urlParams['period_number'] = period
        }
        if (searchValue !== '') {
          urlParams['search'] = searchValue
        }
        if (sorting.length !== 0) {
          urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
        }
        if (urlParams['search']) {
          const timeoutId = setTimeout(() => {
            dispatch(fetchTopics(urlParams))
          }, 400)

          return () => clearTimeout(timeoutId)
        } else {
          dispatch(fetchTopics(urlParams))
        }
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const columns = useMemo<MRT_ColumnDef<TopicType>[]>(
    () => [
      {
        accessorKey: 'title',
        accessorFn: row => row.title,
        id: 'title',
        header: t('Name'),
        Cell: ({ row }) => (
          <Typography width={200} sx={{ whiteSpace: 'normal' }}>
            {row.original.title}
          </Typography>
        )
      },
      {
        accessorKey: 'subject',
        accessorFn: row => row.subject,
        id: 'subject',
        header: t('Subject'),
        Cell: ({ row }) => <Typography>{row.original.subject}</Typography>
      },
      {
        accessorKey: 'classyear',
        accessorFn: row => row.classyear,
        id: 'classyear',
        header: t('Classroom'),
        Cell: ({ row }) => <Typography>{row.original.classyear}</Typography>
      },
      {
        accessorKey: 'level',
        accessorFn: row => row.level,
        id: 'level',
        header: t('Level'),
        Cell: ({ row }) => <Typography>{row.original.level}</Typography>
      },
      {
        accessorKey: 'period',
        accessorFn: row => row.period,
        id: 'period',
        header: t('Quarter'),
        Cell: ({ row }) => <Typography>{row.original.period}</Typography>
      },
      {
        accessorKey: 'language',
        accessorFn: row => row.language,
        id: 'language',
        header: t('Language'),
        Cell: ({ row }) => <Typography>{renderLangType(row.original.language)}</Typography>
      },
      {
        accessorKey: 'tags',
        accessorFn: row => row.tags,
        id: 'tags',
        header: t('Tags'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {row.original.tags && row.original.tags.map((tag, index) => <Typography key={index}>{tag}</Typography>)}
          </Box>
        )
      },
      {
        accessorKey: 'book',
        accessorFn: row => row.book?.title,
        id: 'book',
        header: t('Book'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              component={Link}
              href={`/books/view/${row.original.book?.id}`}
              color={'primary.main'}
              sx={{ fontWeight: '600', textDecoration: 'none' }}
            >
              {row.original.book?.title}
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
    data: topics_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: topics_list.error
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
        <Translations text='Total' /> {topics_list.total}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/topics/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
        {ability?.can('write', 'admin_topics') ? (
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
    rowCount: topics_list.total,
    initialState: {
      columnVisibility: { language: false, tags: false, book: false }
    },
    state: {
      density: 'compact',
      isLoading: topics_list.loading || loadingQueries,
      pagination,
      rowSelection,
      sorting
    }
  })

  if (topics_list.error) {
    return <Error error={topics_list.error} />
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
                  {ability.can('write', 'admin_topics') ? (
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
                    placeholder={t('TopicSearch') as string}
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
                {ability.can('write', 'admin_topics') ? (
                  <Grid item xs={12} sm={12} md={3} lg={3}>
                    <ButtonGroup variant='contained' ref={anchorRef} aria-label='split button' sx={{ display: 'flex' }}>
                      <Button
                        component={Link}
                        variant='contained'
                        fullWidth
                        href='/topics/create'
                        startIcon={<Icon icon='tabler:plus' />}
                      >
                        <Translations text='AddTopic' />
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
                                <MenuItem component={Link} href='/topics/import'>
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
              level={level}
              period={period}
              subject={subject}
              subjects={settings.data && settings.data.subject?.subjects}
              classyear={classyear}
              handleFilterLevel={handleFilterLevel}
              handleFilterPeriod={handleFilterPeriod}
              handleFilterSubject={handleFilterSubject}
              handleFilterClassyear={handleFilterClassyear}
            />
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

TopicsList.acl = {
  action: 'read',
  subject: 'admin_topics'
}

export default TopicsList
