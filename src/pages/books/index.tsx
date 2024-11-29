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
import { Divider, InputAdornment, styled } from '@mui/material'

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
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
import { ParamsContext } from 'src/app/context/ParamsContext'
import TableHeader from 'src/widgets/books/list/TableHeader'
import { BookType } from 'src/entities/app/BooksType'
import { deleteBook, fetchAuthors, fetchBooks } from 'src/features/store/apps/books'
import { fetchSettings } from 'src/features/store/apps/settings'
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

const Img = styled('img')(() => ({
  width: '100%'
}))

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

const BooksList = () => {
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

  const [authorQuery, setAuthorQuery] = useState<string | null>(null)
  const [yearQuery, setYearQuery] = useState<number | null>(null)
  const [categoryQuery, setCategoryQuery] = useState<string | null>(null)

  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // ** Hooks
  const router = useRouter()
  const pathname = usePathname()
  const showDialog = useDialog()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { booksParams, setSearchParams } = useContext(ParamsContext)
  const { books_list, book_authors } = useSelector((state: RootState) => state.books)
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
    if (router.isReady) {
      const page = validatePageParam(searchParams.get('page'))
      const searchQuery = validateSearchParam(searchParams.get('search'))
      const year = validatePageParam(searchParams.get('year'))
      const author = validateSearchParam(searchParams.get('author'))
      const category = validateSearchParam(searchParams.get('category'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      if (category) {
        paramsToSet.category = category
        setCategoryQuery(category)
      } else if (booksParams.category) {
        paramsToRedirect.category = booksParams.category
        setCategoryQuery(validateSearchParam(booksParams.category as string) || '')
      }

      if (author) {
        paramsToSet.author = author
        setAuthorQuery(author)
      } else if (booksParams.author) {
        paramsToRedirect.author = booksParams.author
        setAuthorQuery(validateSearchParam(booksParams.author as string) || '')
      }

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (booksParams.search) {
        paramsToRedirect.search = booksParams.search
        setSearchValue(validateSearchParam(booksParams.search as string))
      }

      if (year) {
        paramsToSet.year = year
        setYearQuery(year)
      } else if (booksParams.year) {
        paramsToRedirect.year = booksParams.year
        setYearQuery(validatePageParam(booksParams.year as string))
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (booksParams.page) {
          paramsToRedirect.page = booksParams.page
          setPagination({ pageIndex: parseInt(booksParams.page as string), pageSize: 12 })
        } else if (page === null && !booksParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('booksParams', paramsToSet)
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
      if (authorQuery !== '') {
        urlParams['author'] = authorQuery
      }
      if (categoryQuery !== '') {
        urlParams['category'] = categoryQuery
      }
      if (yearQuery) {
        urlParams['year'] = yearQuery
      }
      if (sorting.length !== 0) {
        urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
      }
      const timeoutId = setTimeout(() => {
        dispatch(fetchBooks(urlParams))
      }, 400)

      return () => clearTimeout(timeoutId)
    }
  }, [dispatch, loadingQueries, authorQuery, sorting, categoryQuery, pagination, searchValue, yearQuery])

  useEffect(() => {
    dispatch(fetchSettings({}))
    dispatch(fetchAuthors())
  }, [dispatch])

  useEffect(() => {
    if (!searchValue && !yearQuery && !categoryQuery && !authorQuery) {
      setIsFiltered(false)
    } else {
      setIsFiltered(true)
    }
  }, [authorQuery, categoryQuery, searchValue, yearQuery])

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
    setYearQuery(null)
    setCategoryQuery('')
    setAuthorQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '0')
    params.delete('search')
    params.delete('author')
    params.delete('year')
    params.delete('category')
    const contextParams = booksParams
    delete contextParams.search
    delete contextParams.author
    delete contextParams.category
    delete contextParams.year
    setSearchParams('booksParams', contextParams)
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
      const contextParams = delete booksParams.search
      setSearchParams('booksParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterAuthor = (val: string | null) => {
    setAuthorQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('author')

    const contextParams = delete booksParams.author
    setSearchParams('booksParams', contextParams)

    if (val) {
      params.set('author', val)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterCategory = (val: string | null) => {
    setCategoryQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')

    const contextParams = delete booksParams.category
    setSearchParams('booksParams', contextParams)

    if (val) {
      params.set('category', val)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterYear = (val: number | null) => {
    if (val) {
      setYearQuery(val)
    } else setYearQuery(null)
    const params = new URLSearchParams(searchParams.toString())
    if (val) {
      params.set('year', val.toString())
    } else {
      params.delete('year')
      const contextParams = delete booksParams.year
      setSearchParams('booksParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleShowDialog = async (arr?: string[]) => {
    const confirmed = await showDialog()
    if (confirmed) {
      if (arr) {
        handleDeleteBook(arr)
      } else {
        handleDeleteBook(Object.keys(rowSelection))
        setRowSelection({})
      }
    } else {
      setRowSelection({})
    }
  }

  const handleDeleteBook = async (arr: string[]) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteBook(arr))
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
            dispatch(fetchBooks(urlParams))
          }, 400)

          return () => clearTimeout(timeoutId)
        } else {
          dispatch(fetchBooks(urlParams))
        }
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const columns = useMemo<MRT_ColumnDef<BookType>[]>(
    () => [
      {
        accessorKey: 'preview',
        accessorFn: row => row.file_preview,
        id: 'preview',
        header: t('Book'),
        Cell: ({ row }) => (
          <Box position='relative' display='flex' justifyContent='center' width={100} height={150}>
            <Img
              alt='book-preview'
              src={row.original.file_preview !== null ? row.original.file_preview : '/images/default_cover.png'}
              sx={{
                flexGrow: 1,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e: any) => (e.target.src = '/images/default_cover.png')}
            />
          </Box>
        )
      },
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
        accessorKey: 'authors',
        accessorFn: row => row.authors,
        id: 'authors',
        header: t('Authors'),
        Cell: ({ row }) => (
          <Box display='flex' flexDirection='column'>
            {row.original.authors &&
              row.original.authors.map((author, index) => {
                return (
                  <Typography key={index}>
                    {row.original.authors.length - 1 !== index ? author + ', ' : author}
                  </Typography>
                )
              })}
          </Box>
        )
      },
      {
        accessorKey: 'categories',
        accessorFn: row => row.categories,
        id: 'categories',
        header: t('Categories'),
        Cell: ({ row }) => (
          <Box display='flex' flexDirection='column'>
            {row.original.categories &&
              row.original.categories.map((category, index) => {
                return (
                  <Typography key={index}>
                    {row.original.categories.length - 1 !== index ? category + ', ' : category}
                  </Typography>
                )
              })}
          </Box>
        )
      },
      {
        accessorKey: 'pages',
        accessorFn: row => row.pages,
        id: 'pages',
        header: t('PageCount'),
        Cell: ({ row }) => <Typography>{row.original.pages}</Typography>
      },
      {
        accessorKey: 'year',
        accessorFn: row => row.year,
        id: 'year',
        header: t('Year'),
        Cell: ({ row }) => <Typography>{row.original.year}</Typography>
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
    data: books_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: books_list.error
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
        <Translations text='Total' /> {books_list.total}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/books/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
        {ability?.can('write', 'admin_books') ? (
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
    rowCount: books_list.total,
    initialState: {
      columnVisibility: { pages: false, year: false }
    },
    state: {
      density: 'compact',
      isLoading: books_list.loading || loadingQueries,
      pagination,
      rowSelection,
      sorting
    }
  })

  if (books_list.error) {
    return <Error error={books_list.error} />
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
                  {ability.can('write', 'admin_books') ? (
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
                    placeholder={t('BooksSearch') as string}
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
                {ability.can('write', 'admin_books') ? (
                  <Grid item xs={12} sm={12} md={3} lg={3}>
                    <Button
                      sx={{ mb: 2 }}
                      component={Link}
                      variant='contained'
                      fullWidth
                      href='/books/create'
                      startIcon={<Icon icon='tabler:plus' />}
                    >
                      <Translations text='AddBook' />
                    </Button>
                  </Grid>
                ) : null}
              </Grid>
            </CardContent>

            <Divider sx={{ my: '0 !important' }} />

            <TableHeader
              authors={book_authors.data ? book_authors.data : []}
              categories={settings.data?.general?.book_categories ? settings.data.general.book_categories : []}
              authorQuery={authorQuery}
              handleFilterAuthor={handleFilterAuthor}
              categoryQuery={categoryQuery}
              handleFilterCategory={handleFilterCategory}
              yearQuery={yearQuery}
              handleFilterYear={handleFilterYear}
            />
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

BooksList.acl = {
  action: 'read',
  subject: 'admin_books'
}

export default BooksList
