// ** React Imports
import { useState, useEffect, useContext, ChangeEvent, useMemo, useRef } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import { Theme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import {
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  ClickAwayListener,
  Divider,
  FormControlLabel,
  Grow,
  InputAdornment,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Tooltip,
  useMediaQuery
} from '@mui/material'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import { deleteUser, fetchUsers } from 'src/features/store/apps/user'

// ** Third Party Imports
import { useTranslation } from 'react-i18next'

// ** Types Imports
import { RootState, AppDispatch } from 'src/features/store'
import { ThemeColor } from 'src/shared/layouts/types'
import { UserType } from 'src/entities/school/UserType'

// ** Utils Import
import { getInitials } from 'src/shared/utils/get-initials'
import { renderRole } from 'src/features/utils/ui/renderRole'
import { renderPhone } from 'src/features/utils/ui/renderPhone'
import { renderUsername } from 'src/features/utils/ui/renderUsername'
import { fetchClassroomsLite } from 'src/features/store/apps/classrooms'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'

// ** Custom Components Imports
import CustomAvatar from 'src/shared/components/mui/avatar'
import TableHeader from 'src/widgets/users/list/TableHeader'
import CustomTextField from 'src/shared/components/mui/text-field'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import Translations from 'src/app/layouts/components/Translations'
import { useAuth } from 'src/features/hooks/useAuth'
import { useDialog } from 'src/app/context/DialogContext'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import Error from 'src/widgets/general/Error'
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
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
import CustomChip from 'src/shared/components/mui/chip'
import isAfter from 'date-fns/isAfter'
import subDays from 'date-fns/subDays'

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

const validateIdsParam = (search: string[]) => {
  const filteredArr = search.filter(value => {
    if (value !== '' && !isNaN(parseInt(value)) && parseInt(value, 10) >= 0) return true

    return false
  })

  if (filteredArr.length > 0) return filteredArr

  return null
}

const validateStringArrayParam = (search: string[]) => {
  const filteredArr = search.filter(value => {
    if (value && value !== '') return true

    return false
  })

  if (filteredArr.length > 0) return filteredArr

  return null
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

const validateStatusParam = (status: string | null) => {
  if (status && status !== '') {
    if (status === 'active' || status === 'wait' || status === 'blocked') {
      return status
    } else {
      return null
    }
  }
}

const validateParentCountParam = (parent_count: string | null) => {
  if (parent_count && parent_count !== '') {
    if (parent_count === '0' || parent_count === '1' || parent_count === '2' || parent_count === '3') {
      return parent_count
    } else {
      return null
    }
  }
}

const validateChildCountParam = (child_count: string | null) => {
  if (child_count && child_count !== '') {
    if (
      child_count === '0' ||
      child_count === '1' ||
      child_count === '2' ||
      child_count === '3' ||
      child_count === '4' ||
      child_count === '5'
    ) {
      return child_count
    } else {
      return null
    }
  }
}

const UserList = () => {
  // ** State
  const [isFiltered, setIsFiltered] = useState<boolean>(false)
  const [isPageChanged, setIsPageChanged] = useState<boolean>(false)
  const [loadingQueries, setLoadingQueries] = useState<boolean>(true)
  const [roles, setRoles] = useState<string[]>([])
  const [status, setStatus] = useState<string>('')
  const [parents, setParents] = useState<string>('')
  const [children, setChildren] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [lessonHours, setLessonHours] = useState<number[] | null>(null)
  const [classroom, setClassroom] = useState<LiteModelType | null>(null)
  const [checked, setChecked] = useState<boolean>(false)
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
  const { usersParams, setSearchParams } = useContext(ParamsContext)
  const { users_list } = useSelector((state: RootState) => state.user)
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)

  const allDefaultClassroom = {
    key: '',
    value: t('NoClassroom')
  }
  const classrooms = [allDefaultClassroom, ...classrooms_lite_list.data]

  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

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
      const is_active = validateBoolParam(searchParams.get('is_active'))
      const roles = validateStringArrayParam(searchParams.getAll('roles'))
      const status = validateStatusParam(searchParams.get('status'))
      const lesson_hours = validateIdsParam(searchParams.getAll('lesson_hours'))
      const parents_count = validateParentCountParam(searchParams.get('parents_count'))
      const children_count = validateChildCountParam(searchParams.get('children_count'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (usersParams.search) {
        paramsToRedirect.search = usersParams.search
        setSearchValue(validateSearchParam(usersParams.search as string))
      }

      if (current_school && !classrooms_lite_list.loading && classrooms_lite_list.data) {
        const classroom_id = validateIdParam(searchParams.get('classroom_id'))
        if (classroom_id) {
          paramsToSet.classroom_id = classroom_id
          setClassroom(
            classrooms_lite_list.data.find((classroom: LiteModelType) => classroom.key === classroom_id) || null
          )
        } else if (usersParams.classroom_id) {
          paramsToRedirect.classroom_id = usersParams.classroom_id
          setClassroom(
            classrooms_lite_list.data.find(
              (classroom: LiteModelType) => classroom.key === (usersParams.classroom_id as string)
            ) || null
          )
        }
      }

      if (lesson_hours) {
        paramsToSet.lesson_hours = lesson_hours
        if (lesson_hours.length === 1 || lesson_hours.length === 2) {
          setLessonHours(lesson_hours.map(v => parseInt(v)).sort())
        }
      } else if (usersParams.lesson_hours) {
        paramsToRedirect.lesson_hours = usersParams.lesson_hours
        if (usersParams.lesson_hours.length === 1 || usersParams.lesson_hours.length === 2) {
          setLessonHours((usersParams.lesson_hours as string[]).map(v => parseInt(v)).sort())
        }
      }

      if (is_active) {
        paramsToSet.is_active = is_active
        if (is_active === '1') {
          setChecked(true)
        } else if (is_active === '0') {
          setChecked(false)
        }
      } else if (usersParams.is_active) {
        paramsToRedirect.is_active = usersParams.is_active
        if (usersParams.is_active === '1') {
          setChecked(true)
        } else if (usersParams.is_active === '0') {
          setChecked(false)
        }
      }

      if (roles) {
        paramsToSet.roles = roles
        setRoles(roles)
      } else if (usersParams.roles) {
        paramsToRedirect.roles = usersParams.roles
        setRoles(usersParams.roles as string[])
      }

      if (status) {
        paramsToSet.status = status
        setStatus(status)
      } else if (usersParams.status) {
        paramsToRedirect.status = usersParams.status
        setStatus(usersParams.status as string)
      }

      if (parents_count) {
        paramsToSet.parents_count = parents_count
        setParents(parents_count)
      } else if (usersParams.parents_count) {
        paramsToRedirect.parents_count = usersParams.parents_count
        setParents(usersParams.parents_count as string)
      }

      if (children_count) {
        paramsToSet.children_count = children_count
        setChildren(children_count)
      } else if (usersParams.children_count) {
        paramsToRedirect.children_count = usersParams.children_count
        setChildren(usersParams.children_count as string)
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (usersParams.page) {
          paramsToRedirect.page = usersParams.page
          setPagination({ pageIndex: parseInt(usersParams.page as string), pageSize: 12 })
        } else if (page === null && !usersParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('usersParams', paramsToSet)
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
  }, [classrooms_lite_list, current_school, pathname, router])

  useEffect(() => {
    if (loadingQueries === false) {
      const urlParams: any = {
        is_list: true,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize
      }
      if (checked !== false) {
        urlParams['is_active'] = checked
      }
      if (searchValue !== '' && searchValue !== null) {
        urlParams['search'] = searchValue
      }
      if (roles.length > 0) {
        urlParams['roles[]'] = roles
      }
      if (status !== '') {
        urlParams['status'] = status
      }
      if (roles.includes('student') && parents !== '') {
        urlParams['parents_count'] = parents
      }
      if (roles.includes('parent') && children !== '') {
        urlParams['children_count'] = children
      }
      if (roles.includes('teacher') && lessonHours?.length !== 0) {
        urlParams['lesson_hours'] = lessonHours
      }
      if (classroom !== null) {
        urlParams['classroom_id'] = classroom.key
      }
      if (sorting.length !== 0) {
        urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
      }
      const timeoutId = setTimeout(() => {
        dispatch(fetchUsers(urlParams))
      }, 400)

      return () => clearTimeout(timeoutId)
    }
  }, [
    dispatch,
    searchValue,
    roles,
    status,
    pagination,
    parents,
    children,
    lessonHours,
    classroom,
    checked,
    loadingQueries,
    sorting
  ])

  useEffect(() => {
    current_school !== null &&
      dispatch(
        fetchClassroomsLite({
          limit: 200,
          offset: 0
        })
      )
  }, [current_school, dispatch])

  useEffect(() => {
    if (
      !searchValue &&
      !status &&
      !classroom &&
      !parents &&
      !children &&
      !lessonHours &&
      roles.length === 0 &&
      !checked
    ) {
      setIsFiltered(false)
    } else {
      setIsFiltered(true)
    }
  }, [checked, children, classroom, lessonHours, parents, roles.length, searchValue, status])

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
    setStatus('')
    setClassroom(null)
    setParents('')
    setChildren('')
    setLessonHours(null)
    setRoles([])
    setChecked(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '0')
    params.delete('search')
    params.delete('status')
    params.delete('classroom_id')
    params.delete('parents_count')
    params.delete('children_count')
    params.delete('lesson_hours')
    params.delete('roles')
    params.delete('is_active')
    const contextParams = usersParams
    delete contextParams.search
    delete contextParams.status
    delete contextParams.classroom_id
    delete contextParams.parents_count
    delete contextParams.children_count
    delete contextParams.lesson_hours
    delete contextParams.roles
    delete contextParams.is_active
    setSearchParams('usersParams', contextParams)
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
      const contextParams = delete usersParams.search
      setSearchParams('usersParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterStatus = (val: string | null) => {
    if (val) {
      setStatus(val)
    } else setStatus('')
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('status', val)
    } else {
      params.delete('status')
      const contextParams = delete usersParams.status
      setSearchParams('usersParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterClassroom = (val: LiteModelType | null) => {
    setClassroom(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('classroom_id')
    const contextParams = delete usersParams.classroom_id
    setSearchParams('usersParams', contextParams)
    if (val) {
      params.set('classroom_id', val.key.toString())
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString())
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterParents = (val: string | null) => {
    if (val) {
      setParents(val)
    } else setParents('')
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('parents_count', val)
    } else {
      params.delete('parents_count')
      const contextParams = delete usersParams.parents_count
      setSearchParams('usersParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterChildren = (val: string | null) => {
    if (val) {
      setChildren(val)
    } else setChildren('')
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('children_count', val)
    } else {
      params.delete('children_count')
      const contextParams = delete usersParams.children_count
      setSearchParams('usersParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterLessonHours = (val: string | null) => {
    const arr = val && val.split('-').map(Number)
    setLessonHours(arr ? arr : null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('lesson_hours')
    const contextParams = delete usersParams.lesson_hours
    setSearchParams('usersParams', contextParams)
    if (arr && arr.length > 0) {
      arr.map((hour: number) => {
        params.append('lesson_hours', hour.toString())
      })
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleRoleChange = (val: string[]) => {
    setRoles(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('roles')
    const contextParams = delete usersParams.roles
    setSearchParams('usersParams', contextParams)
    if (val.length > 0) {
      val.map((v: string) => {
        params.append('roles', v)
      })
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('is_active')
    const contextParams = delete usersParams.is_active
    setSearchParams('usersParams', contextParams)
    if (event.target.checked) {
      params.set('is_active', '1')
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleShowDialog = async (users?: UserType[]) => {
    const confirmed = await showDialog()
    const selectedUsers = Object.keys(rowSelection)
    const deleteItems = users ? users : users_list.data.filter((item: UserType) => selectedUsers.includes(item.id))
    if (confirmed) {
      handleDeleteUser(deleteItems)
      if (!users) {
        setRowSelection({})
      }
    } else {
      setRowSelection({})
    }
  }

  const handleDeleteUser = async (users: UserType[]) => {
    const deleteData: any[] = []
    users.map((user: UserType) => {
      const obj: any = {}
      obj.school = user.school_id
      obj.user = user.id
      obj.role = user.role
      deleteData.push(JSON.stringify(obj))
    })
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteUser(deleteData))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        const urlParams: any = {
          is_list: true,
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize
        }
        if (checked !== false) {
          urlParams['is_active'] = checked
        }
        if (searchValue !== '' && searchValue !== null) {
          urlParams['search'] = searchValue
        }
        if (roles.length > 0) {
          urlParams['roles[]'] = roles
        }
        if (status !== '') {
          urlParams['status'] = status
        }
        if (roles.includes('student') && parents !== '') {
          urlParams['parents_count'] = parents
        }
        if (roles.includes('parent') && children !== '') {
          urlParams['children_count'] = children
        }
        if (roles.includes('teacher') && lessonHours?.length !== 0) {
          urlParams['lesson_hours'] = lessonHours
        }
        if (classroom !== null) {
          urlParams['classroom_id'] = classroom.key
        }
        if (sorting.length !== 0) {
          urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
        }
        if (Object.keys(urlParams).length > 2) {
          const timeoutId = setTimeout(() => {
            dispatch(fetchUsers(urlParams))
          }, 400)

          return () => clearTimeout(timeoutId)
        } else {
          dispatch(fetchUsers(urlParams))
        }
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const columns = useMemo<MRT_ColumnDef<UserType>[]>(
    () => [
      {
        accessorKey: 'name',
        accessorFn: row => row.last_name,
        id: 'name',
        header: t('FullnameAndRole'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderAvatar(row.original)}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {renderUserFullname(row.original.last_name, row.original.first_name, row.original.middle_name)}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                {renderRole(row.original.role)}
              </Typography>
            </Box>
            {row.original.created_at && isAfter(new Date(row.original.created_at), subDays(new Date(), 7)) && (
              <Tooltip placement='top' title={t('UserIsNew')}>
                <Box>
                  <CustomChip rounded label={t('New')} skin='light' size='small' color='info' sx={{ ml: 3 }} />
                </Box>
              </Tooltip>
            )}
          </Box>
        )
      },
      {
        accessorKey: 'username',
        accessorFn: row => row.username,
        id: 'username',
        header: t('Username'),
        Cell: ({ row }) => <Typography>{renderUsername(row.original.username)}</Typography>
      },
      {
        accessorKey: 'phone',
        accessorFn: row => row.phone,
        id: 'phone',
        header: t('Phone'),
        Cell: ({ row }) => <Typography>{renderPhone(row.original.phone)}</Typography>
      },
      {
        accessorKey: 'school',
        accessorFn: row => row.school_name,
        id: 'school',
        header: t('School'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography>{row.original.school_name}</Typography>
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              {row.original.school_parent}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'classrooms',
        accessorFn: row => row.classrooms && row.classrooms[0]?.id,
        id: 'classrooms',
        header: t('Classrooms'),
        Cell: ({ row }) => <Typography>{row.original.classrooms.map(classroom => classroom.name + ', ')}</Typography>
      },
      {
        accessorKey: 'teacher_classroom',
        accessorFn: row => row.teacher_classroom?.id,
        id: 'teacher_classroom',
        header: t('Classroom'),
        Cell: ({ row }) => <Typography>{row.original.teacher_classroom?.name}</Typography>
      },
      {
        accessorKey: 'week_hours',
        accessorFn: row => row.week_hours,
        id: 'week_hours',
        header: t('LessonHours'),
        Cell: ({ row }) => <Typography>{row.original.week_hours}</Typography>
      },
      {
        accessorKey: 'parents',
        accessorFn: row => row.parents && row.parents[0]?.id,
        id: 'parents',
        header: t('Parents'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {row.original.parents.map((parent, index) => (
              <Typography sx={{ color: 'text.secondary', fontWeight: 600 }} key={index}>
                {renderUserFullname(parent.last_name, parent.first_name, parent.middle_name)}
              </Typography>
            ))}
          </Box>
        )
      },
      {
        accessorKey: 'children',
        accessorFn: row => row.children && row.children[0]?.id,
        id: 'children',
        header: t('Children'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {row.original.children.map((child, index) => (
              <Typography sx={{ color: 'text.secondary', fontWeight: 600 }} key={index}>
                {renderUserFullname(child.last_name, child.first_name, child.middle_name)}
              </Typography>
            ))}
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
    data: users_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: users_list.error
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
        <Translations text='Total' /> {users_list.total}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/users/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
        {ability?.can('write', 'admin_users') ? (
          <Button
            variant='tonal'
            color='error'
            size='small'
            onClick={() => {
              handleShowDialog([row.original])
            }}
            startIcon={<Icon icon='tabler:trash' fontSize={20} />}
          >
            <Translations text='Delete' />
          </Button>
        ) : null}
      </Box>
    ),
    rowCount: users_list.total,
    initialState: {
      columnVisibility: {
        classrooms: false,
        teacher_classroom: false,
        week_hours: false,
        parents: false,
        children: false
      }
    },
    state: {
      density: 'compact',
      isLoading: users_list.loading || loadingQueries,
      pagination,
      rowSelection,
      sorting
    }
  })

  if (users_list.error) {
    return <Error error={users_list.error} />
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={t('SearchFilter')}
            action={
              <Box display='flex' gap={3}>
                {ability.can('write', 'admin_users') && (
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
                )}
                {ability.can('read', 'admin_school_transfers') && (
                  <Button
                    variant='tonal'
                    color='primary'
                    fullWidth
                    startIcon={<Icon icon='tabler:transform' />}
                    component={Link}
                    href='/school-transfers'
                  >
                    <Translations text='SchoolTransfers' />
                  </Button>
                )}
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
              <Grid item xs={12} sm={9} md={6.5} lg={7.6} xl={7.6}>
                <CustomTextField
                  fullWidth
                  value={searchValue}
                  ref={searchInputRef}
                  placeholder={t('UserSearch') as string}
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
              <Grid item xs={12} sm={3} md={2} lg={1} xl={1}>
                <FormControlLabel
                  label={t('Online')}
                  control={<Checkbox checked={checked} onChange={handleChange} name='archived' />}
                />
              </Grid>
              {ability.can('write', 'admin_users') ? (
                <>
                  <Grid hidden={hidden} item xl={0.3}>
                    <Divider orientation='vertical' sx={{ m: 0, height: '85%' }} />
                  </Grid>
                  <Grid item xs={12} sm={12} md={3.5} lg={3} xl={3}>
                    <ButtonGroup variant='contained' ref={anchorRef} aria-label='split button' sx={{ display: 'flex' }}>
                      <Button
                        component={Link}
                        variant='contained'
                        fullWidth
                        href='/users/create'
                        startIcon={<Icon icon='tabler:plus' />}
                      >
                        <Translations text='AddUser' />
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
                                <MenuItem component={Link} href='/users/import'>
                                  <Translations text='AddMultiple' />
                                </MenuItem>
                              </MenuList>
                            </ClickAwayListener>
                          </Paper>
                        </Grow>
                      )}
                    </Popper>
                  </Grid>
                </>
              ) : null}
            </Grid>
          </CardContent>

          <Divider sx={{ my: '0 !important' }} />

          <TableHeader
            roles={roles}
            status={status}
            parents={parents}
            students={children}
            classrooms={classrooms}
            lessonHours={lessonHours}
            activeClassroom={classroom}
            handleRoleChange={handleRoleChange}
            handleFilterStatus={handleFilterStatus}
            handleFilterParents={handleFilterParents}
            handleFilterChildren={handleFilterChildren}
            handleFilterClassroom={handleFilterClassroom}
            handleFilterLessonHours={handleFilterLessonHours}
          />
          <MaterialReactTable table={table} />
        </Card>
      </Grid>
    </Grid>
  )
}

UserList.acl = {
  action: 'read',
  subject: 'admin_users'
}

export default UserList
