// ** React Imports
import { useState, useEffect, useContext, useMemo, useRef, forwardRef } from 'react'

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
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  IconButton,
  IconButtonProps,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  TextField,
  Tooltip
} from '@mui/material'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Third Party Imports

// ** Types Imports
import { RootState, AppDispatch } from 'src/features/store'

// ** Custom Components Imports
import CustomTextField from 'src/shared/components/mui/text-field'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import Error from 'src/widgets/general/Error'
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
import { ParamsContext } from 'src/app/context/ParamsContext'
import { ContactItemType } from 'src/entities/app/ContactItemsType'
import { fetchContactItems, updateContactItem } from 'src/features/store/apps/contactItems'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { renderContactItemStatus, renderContactItemType } from 'src/features/utils/ui/renderContactItemData'
import TableHeader from 'src/widgets/contact/items/list/TableHeader'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { fetchUsersLite } from 'src/features/store/apps/user'
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
import format from 'date-fns/format'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'

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

const validateStatusParam = (status: string | null) => {
  if (status && status !== '') {
    if (
      status === 'waiting' ||
      status === 'todo' ||
      status === 'processing' ||
      status === 'done' ||
      status === 'backlog' ||
      status === 'rejected'
    ) {
      return status
    } else {
      return null
    }
  }
}

const validateTypeParam = (type: string | null) => {
  if (type && type !== '') {
    if (type === 'review' || type === 'complaint' || type === 'suggestion' || type === 'data_complaint') {
      return type
    } else {
      return null
    }
  }
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

interface PickerProps {
  label?: string
  end: Date | number | null
  start: Date | number | null
}

const startOfCurrentMonth = startOfMonth(new Date())
const startOfMonthDate = format(startOfCurrentMonth, 'yyyy-MM-dd')
const endOfCurrentMonth = endOfMonth(new Date())
const endOfMonthDate = format(endOfCurrentMonth, 'yyyy-MM-dd')

const CustomInput = forwardRef((props: PickerProps, ref) => {
  const startDate = props.start !== null ? format(props.start, 'dd.MM.yyyy') : ''
  const endDate = props.end !== null ? ` - ${props.end && format(props.end, 'dd.MM.yyyy')}` : null
  const value = `${startDate}${endDate !== null ? endDate : ''}`

  return <TextField size='small' fullWidth inputRef={ref} label={props.label || ''} {...props} value={value} />
})

const ContactItemsList = () => {
  // ** State
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isFiltered, setIsFiltered] = useState<boolean>(false)
  const [isPageChanged, setIsPageChanged] = useState<boolean>(false)
  const [loadingQueries, setLoadingQueries] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [firstSelected, setFirstSelected] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 12
  })

  const [date, setDate] = useState<(string | null)[]>([startOfMonthDate, endOfMonthDate])
  const [statusQuery, setStatusQuery] = useState<string>('waiting')
  const [typeQuery, setTypeQuery] = useState<string>('')
  const [userQuery, setUserQuery] = useState<LiteModelType | null>(null)
  const [operatorQuery, setOperatorQuery] = useState<LiteModelType | null>(null)
  const [users, setUsers] = useState<LiteModelType[]>([])
  const [operators, setOperators] = useState<LiteModelType[]>([])
  const [schoolQuery, setSchoolQuery] = useState<LiteModelType | null>(null)

  const isFirstLoad = useRef<boolean>(true)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // ** Hooks
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { contactItemsParams, setSearchParams } = useContext(ParamsContext)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { contact_items_list } = useSelector((state: RootState) => state.contactItems)

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
      operators &&
      users &&
      !schools_lite_list.loading &&
      schools_lite_list.data
    ) {
      const searchQuery = validateSearchParam(searchParams.get('search'))
      const page = validatePageParam(searchParams.get('page'))
      const status = validateStatusParam(searchParams.get('status'))
      const type = validateTypeParam(searchParams.get('type'))
      const user_id = validateIdParam(searchParams.get('user_id'))
      const operator_id = validateIdParam(searchParams.get('operator_id'))
      const school_id = validateIdParam(searchParams.get('school_id'))
      const start_date = validateSearchParam(searchParams.get('start_date'))
      const end_date = validateSearchParam(searchParams.get('end_date'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      const dateToSet: (string | null)[] = [startOfMonthDate, endOfMonthDate]
      if (isFirstLoad.current) {
        if (start_date) {
          dateToSet[0] = start_date
        } else if (contactItemsParams.start_date) {
          paramsToRedirect.start_date = contactItemsParams.start_date
          dateToSet[0] = validateSearchParam(contactItemsParams.start_date as string)
        }

        if (end_date) {
          dateToSet[1] = end_date
        } else if (contactItemsParams.end_date) {
          paramsToRedirect.end_date = contactItemsParams.end_date
          dateToSet[1] = validateSearchParam(contactItemsParams.end_date as string)
        }

        setDate(dateToSet)
        isFirstLoad.current = false
      }

      if (user_id) {
        paramsToSet.user_id = user_id
        setUserQuery(users.find((user: LiteModelType) => user_id === user.key) || null)
      } else if (contactItemsParams.user_id) {
        paramsToRedirect.user_id = contactItemsParams.user_id
        setUserQuery(users.find((user: LiteModelType) => (contactItemsParams.user_id as string) === user.key) || null)
      }

      if (operator_id) {
        paramsToSet.operator_id = operator_id
        setOperatorQuery(operators.find((user: LiteModelType) => operator_id === user.key) || null)
      } else if (contactItemsParams.operator_id) {
        paramsToRedirect.operator_id = contactItemsParams.operator_id
        setOperatorQuery(
          operators.find((user: LiteModelType) => (contactItemsParams.operator_id as string) === user.key) || null
        )
      }

      if (school_id) {
        paramsToSet.school_id = school_id
        setSchoolQuery(schools_lite_list.data.find((school: LiteModelType) => school_id === school.key) || null)
      } else if (contactItemsParams.school_id) {
        paramsToRedirect.school_id = contactItemsParams.school_id
        setSchoolQuery(
          schools_lite_list.data.find(
            (school: LiteModelType) => (contactItemsParams.school_id as string) === school.key
          ) || null
        )
      }

      if (status) {
        paramsToSet.status = status
        setStatusQuery(status)
      } else if (contactItemsParams.status) {
        paramsToRedirect.status = contactItemsParams.status
        setStatusQuery(validateStatusParam(contactItemsParams.status as string) || '')
      }

      if (type) {
        paramsToSet.type = type
        setTypeQuery(type)
      } else if (contactItemsParams.type) {
        paramsToRedirect.type = contactItemsParams.type
        setTypeQuery(validateTypeParam(contactItemsParams.type as string) || '')
      }

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (contactItemsParams.search) {
        paramsToRedirect.search = contactItemsParams.search
        setSearchValue(validateSearchParam(contactItemsParams.search as string))
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (contactItemsParams.page) {
          paramsToRedirect.page = contactItemsParams.page
          setPagination({ pageIndex: parseInt(contactItemsParams.page as string), pageSize: 12 })
        } else if (page === null && !contactItemsParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('contactItemsParams', paramsToSet)
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
  }, [router, users_lite_list.loading, schools_lite_list.data, schools_lite_list.loading, users, operators])

  useEffect(() => {
    const urlParams: any = {
      is_list: true,
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize
    }
    if (searchValue !== '') {
      urlParams['search'] = searchValue
    }
    if (typeQuery !== '') {
      urlParams['type'] = typeQuery
    }
    if (statusQuery !== '') {
      urlParams['status'] = statusQuery
    }
    if (userQuery) {
      urlParams['user_id'] = userQuery.key
    }
    if (operatorQuery) {
      urlParams['updated_by'] = operatorQuery.key
    }
    if (schoolQuery) {
      urlParams['school_id'] = schoolQuery.key
    }
    if (date[0] !== null) {
      urlParams['start_date'] = date[0]
    }
    if (date[1] !== null) {
      urlParams['end_date'] = date[1]
    }
    if (sorting.length !== 0) {
      urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
    }

    const timeoutId = setTimeout(() => {
      dispatch(fetchContactItems(urlParams))
    }, 400)

    const intervalId = setInterval(() => {
      dispatch(fetchContactItems(urlParams))
    }, 30000)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [dispatch, searchValue, pagination, sorting, typeQuery, statusQuery, userQuery, operatorQuery, schoolQuery, date])

  useEffect(() => {
    dispatch(
      fetchUsersLite({
        limit: 5000,
        offset: 0
      })
    )
      .unwrap()
      .then(response => {
        setUsers(response.users)
      })
      .catch(err => {
        console.log(err)
      })
    dispatch(
      fetchUsersLite({
        limit: 200,
        offset: 0,
        role: 'operator'
      })
    )
      .unwrap()
      .then(res => {
        setOperators(res.users)
      })
      .catch(err => {
        console.log(err)
      })
  }, [dispatch])

  useEffect(() => {
    if (!searchValue && !userQuery && !operatorQuery && !schoolQuery && !statusQuery && !typeQuery) {
      setIsFiltered(false)
    } else {
      setIsFiltered(true)
    }
  }, [searchValue, statusQuery, typeQuery, userQuery, operatorQuery, schoolQuery])

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
    setTypeQuery('')
    setStatusQuery('')
    setUserQuery(null)
    setOperatorQuery(null)
    setSchoolQuery(null)
    setDate([null, null])
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '0')
    params.delete('search')
    params.delete('type')
    params.delete('status')
    params.delete('user_id')
    params.delete('operator_id')
    params.delete('school_id')
    params.delete('start_date')
    params.delete('end_date')
    const contextParams = contactItemsParams
    delete contextParams.search
    delete contextParams.type
    delete contextParams.status
    delete contextParams.user_id
    delete contextParams.operator_id
    delete contextParams.school_id
    delete contextParams.start_date
    delete contextParams.end_date
    setSearchParams('contactItemsParams', contextParams)
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
      const contextParams = delete contactItemsParams.search
      setSearchParams('contactItemsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterType = (val: string | null) => {
    if (val) {
      setTypeQuery(val)
    } else setTypeQuery('')
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('type', val)
    } else {
      params.delete('type')
      const contextParams = delete contactItemsParams.type
      setSearchParams('contactItemsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterStatus = (val: string | null) => {
    if (val) {
      setStatusQuery(val)
    } else setStatusQuery('')
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== '') {
      params.set('status', val)
    } else {
      params.delete('status')
      const contextParams = delete contactItemsParams.status
      setSearchParams('contactItemsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterUser = (val: LiteModelType | null) => {
    setUserQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('user_id')

    const contextParams = delete contactItemsParams.user_id
    setSearchParams('contactItemsParams', contextParams)

    if (val) {
      params.set('user_id', val.key.toString())
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterOperator = (val: LiteModelType | null) => {
    setOperatorQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('operator_id')

    const contextParams = delete contactItemsParams.operator_id
    setSearchParams('contactItemsParams', contextParams)

    if (val) {
      params.set('operator_id', val.key.toString())
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterSchool = (val: LiteModelType | null) => {
    setSchoolQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('school_id')

    const contextParams = delete contactItemsParams.school_id
    setSearchParams('contactItemsParams', contextParams)

    if (val) {
      params.set('school_id', val.key)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleDateParam = (start_date: string | null, end_date: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    const contextParams = { ...contactItemsParams }
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
    setSearchParams('contactItemsParams', contextParams)
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const convertDataToExcel = (data: any | null) => {
    if (!data) return

    const transformedData = data?.map((row: any) => {
      const obj: any = {}
      obj['Haty'] = row.message
      obj['Ýagdaýy'] = renderContactItemStatus(row.status)
      obj['Görnüşi'] = renderContactItemType(row.type)
      obj['Ulanyjy'] = renderUserFullname(row.user?.last_name, row.user?.first_name, row.user?.middle_name)
      obj['Mekdep'] = row.school ? row.school?.name : ''
      obj['Etrap'] = row.school?.parent ? row.school.parent.name : ''
      obj['Ugradylan wagty'] = row.created_at && format(new Date(row.created_at), 'dd.MM.yyyy HH:mm')

      return obj
    })

    const worksheet = XLSX.utils.json_to_sheet(transformedData)
    const workbook = XLSX.utils.book_new()
    const wscols = [{ wch: 50 }, { wch: 10 }, { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 20 }]
    worksheet['!cols'] = wscols
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gelen hatlar')

    const exportDate = format(new Date(), 'dd.MM.yyyy')
    XLSX.writeFile(workbook, `Gelen hatlar ${exportDate}.xlsx`)
  }

  useEffect(() => {
    if (Object.keys(rowSelection).length === 1) {
      setFirstSelected(Object.keys(rowSelection)[0])
    } else if (Object.keys(rowSelection).length === 0) {
      setFirstSelected(null)
    }
  }, [rowSelection])

  const handleClose = () => {
    setIsOpen(false)
    setRowSelection({})
  }

  const onRelateContactItems = () => {
    setIsOpen(false)
    handleRelateContactItems()
  }

  const handleRelateContactItems = async () => {
    if (!firstSelected) return

    const toastId = toast.loading(t('ApiLoading'))

    const childIds = Object.keys(rowSelection)?.filter(item => item !== firstSelected) || []

    const formDataToSend = new FormData()
    if (childIds.length > 0) {
      childIds.map(id => {
        formDataToSend.append('related_children_ids', id)
      })
    }

    await dispatch(updateContactItem({ data: formDataToSend, id: firstSelected }))
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
        if (typeQuery !== '') {
          urlParams['type'] = typeQuery
        }
        if (statusQuery !== '') {
          urlParams['status'] = statusQuery
        }
        if (userQuery) {
          urlParams['user_id'] = userQuery.key
        }
        if (operatorQuery) {
          urlParams['operator_id'] = operatorQuery.key
        }
        if (schoolQuery) {
          urlParams['school_id'] = schoolQuery.key
        }
        if (sorting.length !== 0) {
          urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
        }
        dispatch(fetchContactItems(urlParams))
        setRowSelection({})
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const handleChangeStatus = (e: SelectChangeEvent<string>, item: ContactItemType) => {
    const toastId = toast.loading(t('ApiLoading'))
    const formDataToSend = new FormData()
    formDataToSend.append('status', e.target.value)

    dispatch(updateContactItem({ data: formDataToSend, id: item.id as string }))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        const urlParams: any = {
          is_list: true,
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize
        }
        if (searchValue !== '') {
          urlParams['search'] = searchValue
        }
        if (typeQuery !== '') {
          urlParams['type'] = typeQuery
        }
        if (statusQuery !== '') {
          urlParams['status'] = statusQuery
        }
        if (userQuery) {
          urlParams['user_id'] = userQuery.key
        }
        if (operatorQuery) {
          urlParams['operator_id'] = operatorQuery.key
        }
        if (schoolQuery) {
          urlParams['school_id'] = schoolQuery.key
        }
        if (sorting.length !== 0) {
          urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
        }
        dispatch(fetchContactItems(urlParams))
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  const columns = useMemo<MRT_ColumnDef<ContactItemType>[]>(
    () => [
      {
        accessorKey: 'message',
        accessorFn: row => row.message,
        id: 'message',
        header: t('Message'),
        Cell: ({ row }) => (
          <Tooltip
            title={row.original.message}
            componentsProps={{
              tooltip: {
                sx: {
                  whiteSpace: 'pre-wrap'
                }
              }
            }}
            arrow
            placement='top'
          >
            <Typography sx={{ whiteSpace: 'normal' }}>
              {row.original.message?.length > 40 ? `${row.original.message.slice(0, 40)}...` : row.original.message}
            </Typography>
          </Tooltip>
        )
      },
      {
        accessorKey: 'type',
        accessorFn: row => row.type,
        id: 'type',
        header: t('Type'),
        Cell: ({ row }) => (
          <Tooltip title={`${t('RelatedContactItems')}: ${row.original.related_children_count}`} arrow placement='top'>
            <Box>
              <Typography>{renderContactItemType(row.original.type)}</Typography>
            </Box>
          </Tooltip>
        )
      },
      {
        accessorKey: 'user',
        accessorFn: row => row.user?.last_name,
        id: 'user',
        header: t('User') + '/' + t('School'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              component={Link}
              href={`/users/view/${row.original.user?.id}`}
              color={'primary.main'}
              sx={{ fontWeight: '600', textDecoration: 'none' }}
            >
              {renderUserFullname(
                row.original.user?.last_name,
                row.original.user?.first_name,
                row.original.user?.middle_name
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
        accessorKey: 'created_at',
        accessorFn: row => row.created_at,
        id: 'created_at',
        header: t('SentTime'),
        Cell: ({ row }) => (
          <Typography>
            {row.original.created_at && format(new Date(row.original.created_at), 'dd.MM.yyyy HH:mm')}
          </Typography>
        )
      },
      {
        accessorKey: 'status',
        accessorFn: row => row.status,
        id: 'status',
        header: t('Status'),
        Cell: ({ row }) => (
          <FormControl fullWidth size='small'>
            <InputLabel id='status-filter-label'>
              <Translations text='Status' />
            </InputLabel>
            <Select
              label={t('Status')}
              value={row.original.status}
              onChange={e => handleChangeStatus(e, row.original)}
              id='status-filter'
              labelId='status-filter-label'
              sx={{ minWidth: 140 }}
            >
              <MenuItem value='waiting'>
                <Translations text='ContactStatusWaiting' />
              </MenuItem>
              <MenuItem value='todo'>
                <Translations text='ContactStatusTodo' />
              </MenuItem>
              <MenuItem value='processing'>
                <Translations text='ContactStatusProcessing' />
              </MenuItem>
              <MenuItem value='done'>
                <Translations text='ContactStatusDone' />
              </MenuItem>
              <MenuItem value='backlog'>
                <Translations text='ContactStatusBacklog' />
              </MenuItem>
              <MenuItem value='rejected'>
                <Translations text='ContactStatusRejected' />
              </MenuItem>
            </Select>
          </FormControl>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    data: contact_items_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: contact_items_list.error
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
        <Translations text='Total' /> {contact_items_list.total}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/contact/items/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
      </Box>
    ),
    rowCount: contact_items_list.total,
    initialState: {
      columnVisibility: {}
    },
    state: {
      density: 'compact',
      isLoading: contact_items_list.loading,
      pagination,
      rowSelection,
      sorting
    }
  })

  if (contact_items_list.error) {
    return <Error error={contact_items_list.error} />
  }

  return (
    <>
      <Dialog
        fullWidth
        open={isOpen}
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
          <CustomCloseButton onClick={handleClose}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <Box
            sx={{
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
              '& svg': { mb: 6, color: 'primary.main' }
            }}
          >
            <Icon icon='tabler:exclamation-circle' fontSize='5rem' />
            <Typography variant='h3' mb={4}>
              <Translations text='DialogContinueTitle' />
            </Typography>
            <Typography>
              <Translations text='DialogContinueText' />
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button
            data-cy='dialog-submit'
            color='primary'
            variant='contained'
            sx={{ mr: 2 }}
            onClick={() => onRelateContactItems()}
          >
            <Translations text='Submit' />
          </Button>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            <Translations text='GoBack' />
          </Button>
        </DialogActions>
      </Dialog>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('SearchFilter')}
              action={
                <Box display={'flex'} gap={3}>
                  {ability.can('write', 'admin_periods') ? (
                    <Button
                      variant='tonal'
                      color='primary'
                      fullWidth
                      sx={{ visibility: rowSelection && Object.keys(rowSelection).length > 1 ? 'visible' : 'hidden' }}
                      startIcon={<Icon icon='tabler:circles-relation' />}
                      onClick={() => setIsOpen(true)}
                    >
                      <Translations text='ConnectContactItems' />
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
                  <Button
                    color='success'
                    variant='tonal'
                    onClick={() => router.push('/contact/items/report')}
                    sx={{ px: 6, minWidth: 260 }}
                    startIcon={<Icon icon='tabler:clipboard-text' fontSize={20} />}
                  >
                    <Translations text='ReportBySchool' />
                  </Button>
                  <Button
                    color='success'
                    variant='contained'
                    disabled={contact_items_list.loading || loadingQueries}
                    onClick={() => {
                      !contact_items_list.loading && convertDataToExcel(contact_items_list.data)
                    }}
                    sx={{ px: 6, minWidth: 140 }}
                    startIcon={<Icon icon='tabler:download' fontSize={20} />}
                  >
                    <Translations text='Export' />
                  </Button>
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
                    placeholder={t('ContactItemsSearch') as string}
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
                        const [start, end] = dates
                        setDate(dates.map((date: string | null) => date && format(new Date(date), 'yyyy-MM-dd')))
                        handleDateParam(start, end)
                      }}
                    />
                  </DatePickerWrapper>
                </Grid>
              </Grid>
            </CardContent>

            <Divider sx={{ my: '0 !important' }} />

            <TableHeader
              hasTypeQuery={true}
              type={typeQuery}
              status={statusQuery}
              user={userQuery}
              users={users}
              operator={operatorQuery}
              operators={operators}
              school={schoolQuery}
              handleFilterUser={handleFilterUser}
              handleFilterOperator={handleFilterOperator}
              handleFilterSchool={handleFilterSchool}
              handleFilterType={handleFilterType}
              handleFilterStatus={handleFilterStatus}
            />
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

ContactItemsList.acl = {
  action: 'read',
  subject: 'admin_contact_items'
}

export default ContactItemsList
