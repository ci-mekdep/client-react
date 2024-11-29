import { forwardRef, SyntheticEvent, useContext, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  IconButtonProps,
  InputAdornment,
  ListItemText,
  MenuItem,
  styled,
  TextField,
  Typography
} from '@mui/material'
import { UserLogType } from 'src/entities/app/UserLogs'
import Icon from 'src/shared/components/icon'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  useMaterialReactTable
} from 'material-react-table'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import format from 'date-fns/format'
import { renderLogSubjectName } from 'src/features/utils/ui/renderLogSubjectName'
import { renderLogSubjectAction } from 'src/features/utils/ui/renderLogSubjectAction'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { renderRole } from 'src/features/utils/ui/renderRole'
import { UserType } from 'src/entities/school/UserType'
import CustomAvatar from 'src/shared/components/mui/avatar'
import { ThemeColor } from 'src/shared/layouts/types'
import { getInitials } from 'src/shared/utils/get-initials'
import Link from 'next/link'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import Error from 'src/widgets/general/Error'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import CustomTextField from 'src/shared/components/mui/text-field'
import { useAuth } from 'src/features/hooks/useAuth'
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
import { ParamsContext } from 'src/app/context/ParamsContext'
import { fetchUsersLite } from 'src/features/store/apps/user'
import { fetchLogs } from 'src/features/store/apps/tools/logs'

interface PickerProps {
  label?: string
  end: Date | number | null
  start: Date | number | null
}

const CustomCloseButton = styled(IconButton)<IconButtonProps>(({ theme }) => ({
  top: 0,
  right: 0,
  color: 'grey.500',
  position: 'absolute',
  boxShadow: theme.shadows[2],
  transform: 'translate(10px, -10px)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette.background.paper} !important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'translate(7px, -5px)'
  }
}))

const CustomInput = forwardRef((props: PickerProps, ref) => {
  const startDate = props.start !== null ? format(props.start, 'dd.MM.yyyy') : ''
  const endDate = props.end !== null ? ` - ${props.end && format(props.end, 'dd.MM.yyyy')}` : null
  const value = `${startDate}${endDate !== null ? endDate : ''}`

  return <TextField size='small' fullWidth inputRef={ref} label={props.label || ''} {...props} value={value} />
})

const subject_names = [
  'users',
  'schools',
  'classrooms',
  'lessons',
  'grades',
  'absents',
  'timetables',
  'subjects',
  'shifts',
  'topics',
  'periods',
  'payments',
  'books',
  'base_subjects',
  'reports',
  'report_items'
]

const initialRoles = [
  {
    id: 1,
    name: 'admin',
    display_name: 'RoleAdmins'
  },
  {
    id: 2,
    name: 'organization',
    display_name: 'RoleOrganizations'
  },
  {
    id: 3,
    name: 'operator',
    display_name: 'RoleOperators'
  },
  {
    id: 4,
    name: 'principal',
    display_name: 'RolePrincipals'
  },
  {
    id: 5,
    name: 'teacher',
    display_name: 'RoleTeachers'
  },
  {
    id: 6,
    name: 'parent',
    display_name: 'RoleParents'
  },
  {
    id: 7,
    name: 'student',
    display_name: 'RoleStudents'
  }
]

// ** renders client column
const renderAvatar = (row: UserType) => {
  if (row.avatar) {
    return (
      <Badge
        color='success'
        invisible={!row.is_active}
        variant='dot'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiBadge-badge': {
            bottom: 2,
            right: 10,
            boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`
          }
        }}
      >
        <CustomAvatar src={row.avatar} sx={{ mr: 2.5, width: 38, height: 38 }} />
      </Badge>
    )
  } else {
    return (
      <Badge
        color='success'
        invisible={!row.is_active}
        variant='dot'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiBadge-badge': {
            bottom: 2,
            right: 10,
            boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`
          }
        }}
      >
        <CustomAvatar
          skin='light'
          color={'primary' as ThemeColor}
          sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
        >
          {getInitials(renderUserFullname(row.last_name, row.first_name, null) || 'Aman Amanow')}
        </CustomAvatar>
      </Badge>
    )
  }
}

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

const validateTypeParam = (type: string | null) => {
  if (type && type !== '') {
    if (type === 'ip' || type === 'id' || type === 'agent' || type === 'properties' || type === 'subject_description') {
      return type
    } else {
      return null
    }
  }
}

const validateSubjectNameParam = (subject_name: string | null) => {
  if (subject_name && subject_name !== '') {
    if (subject_names.includes(subject_name)) {
      return subject_name
    } else {
      return ''
    }
  } else {
    return ''
  }
}

const validateRoleParam = (role: string | null) => {
  if (role && role !== '') {
    if (
      role === 'admin' ||
      role === 'organization' ||
      role === 'operator' ||
      role === 'principal' ||
      role === 'teacher' ||
      role === 'parent' ||
      role === 'student'
    ) {
      return role
    } else {
      return ''
    }
  } else {
    return ''
  }
}

const LogsList = () => {
  // ** State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [activeData, setActiveData] = useState<UserLogType | null>(null)
  const [isPageChanged, setIsPageChanged] = useState<boolean>(false)
  const [loadingQueries, setLoadingQueries] = useState<boolean>(true)
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 12
  })

  const [school, setSchool] = useState<LiteModelType | null>(null)
  const [date, setDate] = useState<(string | null)[]>([null, null])
  const [subjectName, setSubjectName] = useState<string | null>(null)
  const [user, setUser] = useState<LiteModelType | null>(null)
  const [type, setType] = useState<string>('')
  const [role, setRole] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string | null>(null)

  // ** Hooks
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const { current_role } = useAuth()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { toolsLogsParams, setSearchParams } = useContext(ParamsContext)
  const { logs_list } = useSelector((state: RootState) => state.toolLogs)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { users_lite_list } = useSelector((state: RootState) => state.user)

  const givenRoleObject = initialRoles.find((role: any) => role.name === current_role)
  const rolesArr = givenRoleObject
    ? initialRoles.filter((role: any) =>
        current_role === 'admin' || current_role === 'principal'
          ? role.id >= givenRoleObject.id
          : current_role === 'operator'
          ? role.id > 3
          : role.id > givenRoleObject.id
      )
    : initialRoles

  useEffect(() => {
    setLoadingQueries(true)
    if (router.isReady && !schools_lite_list.loading && schools_lite_list.status === 'success') {
      const searchQuery = validateSearchParam(searchParams.get('search'))
      const page = validatePageParam(searchParams.get('page'))
      const start_date = validateSearchParam(searchParams.get('start_date'))
      const end_date = validateSearchParam(searchParams.get('end_date'))
      const type = validateTypeParam(searchParams.get('type'))
      const school_id = validateIdParam(searchParams.get('school_id'))
      const role = validateRoleParam(searchParams.get('role'))
      const user_id = validateIdParam(searchParams.get('user_id'))
      const subject_name = validateSubjectNameParam(searchParams.get('subject_name'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      const dateToSet: (string | null)[] = [null, null]

      if (start_date) {
        dateToSet[0] = start_date
      } else if (toolsLogsParams.start_date) {
        paramsToRedirect.start_date = toolsLogsParams.start_date
        dateToSet[0] = validateSearchParam(toolsLogsParams.start_date as string)
      }

      if (end_date) {
        dateToSet[1] = end_date
      } else if (toolsLogsParams.end_date) {
        paramsToRedirect.end_date = toolsLogsParams.end_date
        dateToSet[1] = validateSearchParam(toolsLogsParams.end_date as string)
      }

      setDate(dateToSet)

      if (type) {
        paramsToSet.type = type
        setType(type)
      } else if (toolsLogsParams.type) {
        paramsToRedirect.type = toolsLogsParams.type
        setType(validateTypeParam(toolsLogsParams.type as string) || '')
      }

      if (school_id) {
        paramsToSet.school_id = school_id
        setSchool(schools_lite_list.data.find((school: LiteModelType) => school.key === school_id) || null)
      } else if (toolsLogsParams.school_id) {
        paramsToRedirect.school_id = toolsLogsParams.school_id
        setSchool(
          schools_lite_list.data.find(
            (school: LiteModelType) => school.key === (toolsLogsParams.school_id as string)
          ) || null
        )
      }

      if (role) {
        paramsToSet.role = role
        setRole(role)
      } else if (toolsLogsParams.role) {
        paramsToRedirect.role = toolsLogsParams.role
        setRole(validateRoleParam(toolsLogsParams.role as string) || '')
      }

      if (subject_name) {
        paramsToSet.subject_name = subject_name
        setSubjectName(subject_name)
      } else if (toolsLogsParams.subject_name) {
        paramsToRedirect.subject_name = toolsLogsParams.subject_name
        setSubjectName(validateSubjectNameParam(toolsLogsParams.subject_name as string) || '')
      }

      if (!users_lite_list.loading && users_lite_list.data) {
        if (user_id) {
          paramsToSet.user_id = user_id
          setUser(users_lite_list.data.find((user: LiteModelType) => user_id === user.key) || null)
        } else if (toolsLogsParams.user_id) {
          paramsToRedirect.user_id = toolsLogsParams.user_id
          setUser(
            users_lite_list.data.find((user: LiteModelType) => (toolsLogsParams.user_id as string) === user.key) || null
          )
        }
      }

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (toolsLogsParams.search) {
        paramsToRedirect.search = toolsLogsParams.search
        setSearchValue(validateSearchParam(toolsLogsParams.search as string))
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (toolsLogsParams.page) {
          paramsToRedirect.page = toolsLogsParams.page
          setPagination({ pageIndex: parseInt(toolsLogsParams.page as string), pageSize: 12 })
        } else if (page === null && !toolsLogsParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('toolsLogsParams', paramsToSet)
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
  }, [router, users_lite_list, schools_lite_list])

  useEffect(() => {
    if (!loadingQueries && school) {
      const urlParams: any = {
        is_list: true,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        school_id: school.key
      }
      if (searchValue !== '') {
        urlParams['search'] = searchValue
      }
      if (date[0] !== null) {
        urlParams['start_date'] = date[0]
      }
      if (date[1] !== null) {
        urlParams['end_date'] = date[1]
      }
      if (user) {
        urlParams['user_id'] = user.key
      }
      if (subjectName) {
        urlParams['subject_name'] = subjectName
      }
      if (type !== '') {
        urlParams['search_type'] = type
      }
      if (sorting.length !== 0) {
        urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
      }

      const timeoutId = setTimeout(() => {
        dispatch(fetchLogs(urlParams))
      }, 400)

      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [dispatch, subjectName, date, loadingQueries, pagination, school, searchValue, sorting, type, user])

  useEffect(() => {
    setIsPageChanged(true)
    if (router.isReady && !loadingQueries) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', pagination.pageIndex.toString())
      router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize])

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
    if (school && school.key) {
      dispatch(
        fetchUsersLite({
          limit: 5000,
          offset: 0,
          school_id: school.key,
          ...(role ? { role: role } : null)
        })
      )
    }
  }, [dispatch, school, role])

  const handleSearchValue = (val: string) => {
    setSearchValue(val)

    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('search', val)
    } else {
      params.delete('search')
      const contextParams = delete toolsLogsParams.search
      setSearchParams('toolsLogsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterType = (val: string) => {
    setType(val)

    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('type', val)
    } else {
      params.delete('type')
      const contextParams = delete toolsLogsParams.type
      setSearchParams('toolsLogsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterSchool = (val: LiteModelType | null) => {
    setSchool(val)

    const params = new URLSearchParams(searchParams.toString())
    params.delete('school_id')

    const contextParams = toolsLogsParams
    delete contextParams.school_id
    setSearchParams('toolsLogsParams', contextParams)

    if (val) {
      params.set('school_id', val.key.toString())
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterSubjectName = (val: string | null) => {
    setSubjectName(val)

    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('subject_name', val)
    } else {
      params.delete('subject_name')
      const contextParams = delete toolsLogsParams.subject_name
      setSearchParams('toolsLogsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleDateParam = (start_date: string | null, end_date: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    const contextParams = { ...toolsLogsParams }
    if (start_date) {
      params.set('start_date', format(new Date(start_date), 'yyyy-MM-dd'))
    } else {
      params.delete('start_date')
      delete contextParams.start_date
    }
    if (end_date) {
      params.set('end_date', format(new Date(end_date), 'yyyy-MM-dd'))
    } else {
      params.delete('end_date')
      delete contextParams.end_date
    }
    setSearchParams('toolsLogsParams', contextParams)
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleFilterRole = (val: string) => {
    setRole(val)

    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('role', val)
    } else {
      params.delete('role')
      const contextParams = delete toolsLogsParams.role
      setSearchParams('toolsLogsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterUser = (val: LiteModelType | null) => {
    setUser(val)

    const params = new URLSearchParams(searchParams.toString())
    params.delete('user_id')

    const contextParams = toolsLogsParams
    delete contextParams.user_id
    setSearchParams('toolsLogsParams', contextParams)

    if (val) {
      params.set('user_id', val.key.toString())
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleClose = () => {
    setDialogOpen(false)
    setActiveData(null)
  }

  const columns = useMemo<MRT_ColumnDef<UserLogType>[]>(
    () => [
      {
        accessorKey: 'date_ip',
        accessorFn: row => row.created_at,
        id: 'date_ip',
        header: t('DateAndIp'),
        Cell: ({ row }) => (
          <Box>
            <Typography variant='h6' fontWeight={600}>
              {row.original.created_at && format(new Date(row.original.created_at), 'dd.MM.yyyy HH:mm')}
            </Typography>
            <Typography variant='body2'>{row.original.session?.ip}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'subject',
        accessorFn: row => row.subject_name,
        id: 'subject',
        header: t('UserAction'),
        Cell: ({ row }) => (
          <Box>
            <Typography variant='h6' fontWeight={600}>
              {renderLogSubjectName(row.original.subject_name) +
                ' ' +
                renderLogSubjectAction(row.original.subject_action)}
            </Typography>
            <Typography variant='body2'>{row.original.subject_description}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'user',
        accessorFn: row => row.user?.last_name,
        id: 'user',
        header: t('FullnameAndRole'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {row.original.user && renderAvatar(row.original.user)}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                component={Link}
                href={`/users/view/${row.original.user?.id}`}
                color={'primary.main'}
                sx={{ fontWeight: 600, textDecoration: 'none' }}
              >
                {row.original.user &&
                  renderUserFullname(
                    row.original.user?.last_name,
                    row.original.user?.first_name,
                    row.original.user?.middle_name
                  )}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                {row.original.user && renderRole(row.original.user.role)}
              </Typography>
            </Box>
          </Box>
        )
      },
      {
        accessorKey: 'school',
        accessorFn: row => row.school.name,
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
        accessorKey: 'device',
        accessorFn: row => row.session?.os,
        id: 'device',
        header: t('Device'),
        Cell: ({ row }) => (
          <Typography>
            {row.original.session &&
              `${row.original.session.os + ' ' + row.original.session.os_version} / ${
                row.original.session.browser + ' ' + row.original.session.browser_version
              }`}
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
    enableStickyHeader: true,
    enableGlobalFilter: false,
    enableRowSelection: false,
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
    data: logs_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: logs_list.error
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
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
        <Translations text='Total' /> {logs_list.total}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Button
          variant='tonal'
          size='small'
          onClick={() => {
            setActiveData(row.original)
            setDialogOpen(true)
          }}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
      </Box>
    ),
    rowCount: logs_list.total,
    initialState: {
      columnVisibility: {
        device: false
      }
    },
    state: {
      density: 'compact',
      isLoading: logs_list.loading,
      pagination,
      sorting
    }
  })

  if (logs_list.error) {
    return <Error error={logs_list.error} />
  }

  return (
    <>
      <Dialog
        fullWidth
        open={dialogOpen}
        onClose={handleClose}
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 512 }, '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(6)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <CustomCloseButton onClick={() => setDialogOpen(false)}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <Typography variant='h4' textAlign='center' fontWeight={600} marginBottom={5}>
            <Translations text='DetailedInfo' />
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'left',
              justifyContent: 'left',
              flexDirection: 'column',
              marginBottom: 5
            }}
          >
            {activeData && activeData.properties ? (
              Object.entries(activeData.properties).map(([key, value]) => (
                <Box key={key} gap={3} marginBottom={3} display={'flex'} alignItems={'center'}>
                  <Typography variant='h5' fontWeight={600}>
                    {key}:
                  </Typography>
                  <Typography variant='h5'>
                    {typeof value !== 'object' ? (value as string) : JSON.stringify(value)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant='h6' textAlign='center' marginBottom={5}>
                <Translations text='NoRows' />
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('Logs')} />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={8}>
                  <CustomTextField
                    fullWidth
                    value={searchValue}
                    placeholder={t('LogsSearch') as string}
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
                <Grid item xs={12} sm={12} md={6} lg={6} xl={2}>
                  <TextField
                    select
                    fullWidth
                    size='small'
                    defaultValue={type}
                    label={t('SearchType')}
                    SelectProps={{
                      value: type,
                      onChange: e => handleFilterType(e.target.value as string)
                    }}
                  >
                    <MenuItem value='ip'>
                      <Translations text='ByIP' />
                    </MenuItem>
                    <MenuItem value='id'>
                      <Translations text='ByID' />
                    </MenuItem>
                    <MenuItem value='agent'>
                      <Translations text='ByOS' />
                    </MenuItem>
                    <MenuItem value='properties'>
                      <Translations text='ByAttributes' />
                    </MenuItem>
                    <MenuItem value='subject_description'>
                      <Translations text='ByName' />
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={2}>
                  <DatePickerWrapper>
                    <DatePicker
                      id='date'
                      locale='tm'
                      selectsRange
                      autoComplete='off'
                      selected={date[0] ? new Date(date[0]) : null}
                      startDate={date[0] ? new Date(date[0]) : null}
                      endDate={date[1] ? new Date(date[1]) : null}
                      dateFormat='dd.MM.yyyy'
                      showYearDropdown
                      showMonthDropdown
                      placeholderText={t('SelectDate') as string}
                      customInput={
                        <CustomInput
                          label={t('Date') as string}
                          start={date[0] ? new Date(date[0]) : null}
                          end={date[1] ? new Date(date[1]) : null}
                        />
                      }
                      calendarStartDay={1}
                      shouldCloseOnSelect={false}
                      onChange={(dates: any) => {
                        setDate(dates.map((date: string | null) => date && format(new Date(date), 'yyyy-MM-dd')))
                        const [start, end] = dates
                        handleDateParam(start, end)
                      }}
                    />
                  </DatePickerWrapper>
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={3}>
                  <CustomAutocomplete
                    id='school_id'
                    size='small'
                    value={school}
                    options={schools_lite_list.data}
                    loading={schools_lite_list.loading}
                    loadingText={t('ApiLoading')}
                    onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                      handleFilterSchool(newValue)
                    }}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => (
                      <li {...props} key={item.key}>
                        <ListItemText>{item.value}</ListItemText>
                      </li>
                    )}
                    getOptionLabel={option => option.value || ''}
                    renderInput={params => (
                      <TextField {...params} helperText={!school && t('SelectSchool')} label={t('School')} />
                    )}
                  />
                </Grid>
                {school && (
                  <>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={3}>
                      <TextField
                        select
                        fullWidth
                        size='small'
                        defaultValue={role}
                        label={t('Role')}
                        SelectProps={{
                          value: role,
                          onChange: e => handleFilterRole(e.target.value as string)
                        }}
                      >
                        {rolesArr.map((role, index) => (
                          <MenuItem key={index} value={role.name}>
                            <Translations text={role.display_name} />
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={3}>
                      <CustomAutocomplete
                        id='user_id'
                        size='small'
                        value={user}
                        options={users_lite_list.data}
                        loading={users_lite_list.loading}
                        loadingText={t('ApiLoading')}
                        onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                          handleFilterUser(newValue)
                        }}
                        noOptionsText={t('NoRows')}
                        renderOption={(props, item) => (
                          <li {...props} key={item.key}>
                            <ListItemText>{item.value}</ListItemText>
                          </li>
                        )}
                        getOptionLabel={option => option.value || ''}
                        renderInput={params => <TextField {...params} label={t('User')} />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={3}>
                      <CustomAutocomplete
                        id='subject_name'
                        size='small'
                        value={subjectName}
                        options={subject_names}
                        onChange={(event: SyntheticEvent, newValue: string | null) => {
                          handleFilterSubjectName(newValue)
                        }}
                        noOptionsText={t('NoRows')}
                        renderOption={(props, item) => (
                          <li {...props} key={item}>
                            <ListItemText>{renderLogSubjectName(item)}</ListItemText>
                          </li>
                        )}
                        getOptionLabel={option => renderLogSubjectName(option) || ''}
                        renderInput={params => <TextField {...params} label={t('UserAction')} />}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
            {school && <MaterialReactTable table={table} />}
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default LogsList
