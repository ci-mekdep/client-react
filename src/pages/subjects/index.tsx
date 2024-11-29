// ** React Imports
import { useState, useEffect, useContext, useRef, ChangeEvent, useMemo } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import {
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
  useMediaQuery
} from '@mui/material'
import { Theme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsersLite } from 'src/features/store/apps/user'
import { fetchClassroomsLite } from 'src/features/store/apps/classrooms'
import { deleteSubject, fetchSubjects } from 'src/features/store/apps/subjects'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Types Imports
import { RootState, AppDispatch } from 'src/features/store'
import { SubjectSettingsType, SubjectType } from 'src/entities/classroom/SubjectType'

// ** Utils Import
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'

// ** Custom Components Imports
import CustomChip from 'src/shared/components/mui/chip'
import TableHeader from 'src/widgets/subjects/list/TableHeader'
import CustomTextField from 'src/shared/components/mui/text-field'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/features/hooks/useAuth'
import { useDialog } from 'src/app/context/DialogContext'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import Error from 'src/widgets/general/Error'
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
import { ParamsContext } from 'src/app/context/ParamsContext'
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
import format from 'date-fns/format'

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
    if (value !== '') return true

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

const SubjectsList = () => {
  // ** State
  const [isFiltered, setIsFiltered] = useState<boolean>(false)
  const [isPageChanged, setIsPageChanged] = useState<boolean>(false)
  const [loadingQueries, setLoadingQueries] = useState<boolean>(true)
  const [checked, setChecked] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [lessonHours, setLessonHours] = useState<number[] | null>(null)
  const [teacherQuery, setTeacherQuery] = useState<LiteModelType | null>(null)
  const [subjectsQuery, setSubjectsQuery] = useState<SubjectSettingsType[]>([])
  const [classroomsQuery, setClassroomsQuery] = useState<LiteModelType[]>([])
  const [isSecondTeacherQuery, setIsSecondTeacherQuery] = useState<boolean>(false)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 12
  })

  const [open, setOpen] = useState<boolean>(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

  // ** Hooks
  const router = useRouter()
  const pathname = usePathname()
  const showDialog = useDialog()
  const { t } = useTranslation()
  const { current_school } = useAuth()
  const searchParams = useSearchParams()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { subjectsParams, setSearchParams } = useContext(ParamsContext)
  const { subjects_list } = useSelector((state: RootState) => state.subjects)
  const { settings } = useSelector((state: RootState) => state.settings)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)

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
      const subject_names = validateStringArrayParam(searchParams.getAll('subject_names'))
      const week_hours = validateIdsParam(searchParams.getAll('week_hours'))
      const is_second_teacher = validateBoolParam(searchParams.get('is_second_teacher'))
      const is_subject_exam = validateBoolParam(searchParams.get('is_subject_exam'))

      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      if (searchQuery) {
        paramsToSet.search = searchQuery
        setSearchValue(searchQuery)
      } else if (subjectsParams.search) {
        paramsToRedirect.search = subjectsParams.search
        setSearchValue(validateSearchParam(subjectsParams.search as string))
      }

      if (
        current_school &&
        !users_lite_list.loading &&
        users_lite_list.data &&
        !classrooms_lite_list.loading &&
        classrooms_lite_list.data
      ) {
        const teacher_id = validateIdParam(searchParams.get('teacher_id'))
        const classroom_ids = validateIdsParam(searchParams.getAll('classroom_ids'))
        if (teacher_id) {
          paramsToSet.teacher_id = teacher_id
          setTeacherQuery(users_lite_list.data.find((user: LiteModelType) => teacher_id === user.key) || null)
        } else if (subjectsParams.teacher_id) {
          paramsToRedirect.teacher_id = subjectsParams.teacher_id
          setTeacherQuery(
            users_lite_list.data.find((user: LiteModelType) => (subjectsParams.teacher_id as string) === user.key) ||
              null
          )
        }

        if (classroom_ids) {
          paramsToSet.classroom_ids = classroom_ids
          setClassroomsQuery(
            classrooms_lite_list.data.filter((classroom: LiteModelType) =>
              classroom_ids.includes(classroom.key.toString())
            ) || null
          )
        } else if (subjectsParams.classroom_ids) {
          paramsToRedirect.classroom_ids = subjectsParams.classroom_ids
          setClassroomsQuery(
            classrooms_lite_list.data.filter(
              (classroom: LiteModelType) =>
                subjectsParams.classroom_ids && subjectsParams.classroom_ids.includes(classroom.key.toString())
            ) || null
          )
        }
      }

      if (subject_names && !settings.loading && settings.data && settings.data.subject.subjects) {
        paramsToSet.subject_names = subject_names
        setSubjectsQuery(
          settings.data.subject.subjects.filter((subject: SubjectSettingsType) =>
            subject_names.includes(subject.name)
          ) || null
        )
      } else if (subjectsParams.subject_names) {
        paramsToRedirect.subject_names = subjectsParams.subject_names
        setSubjectsQuery(
          settings.data.subject.subjects.filter(
            (subject: SubjectSettingsType) =>
              subjectsParams.subject_names && subjectsParams.subject_names.includes(subject.name)
          ) || null
        )
      }

      if (week_hours) {
        paramsToSet.week_hours = week_hours
        if (week_hours.length === 1 || (week_hours.length === 2 && week_hours[0] === week_hours[1])) {
          setLessonHours(week_hours.map(v => parseInt(v)).sort())
        }
      } else if (subjectsParams.week_hours) {
        paramsToRedirect.week_hours = subjectsParams.week_hours
        if (
          subjectsParams.week_hours.length === 1 ||
          (subjectsParams.week_hours.length === 2 && subjectsParams.week_hours[0] === subjectsParams.week_hours[1])
        ) {
          setLessonHours((subjectsParams.week_hours as string[]).map(v => parseInt(v)).sort())
        }
      }

      if (is_second_teacher) {
        paramsToSet.is_second_teacher = is_second_teacher
        if (is_second_teacher === '1') {
          setIsSecondTeacherQuery(true)
        } else if (is_second_teacher === '0') {
          setIsSecondTeacherQuery(false)
        }
      } else if (subjectsParams.is_second_teacher) {
        paramsToRedirect.is_second_teacher = subjectsParams.is_second_teacher
        if (subjectsParams.is_second_teacher === '1') {
          setIsSecondTeacherQuery(true)
        } else if (subjectsParams.is_second_teacher === '0') {
          setIsSecondTeacherQuery(false)
        }
      }

      if (is_subject_exam) {
        paramsToSet.is_subject_exam = is_subject_exam
        if (is_subject_exam === '1') {
          setChecked(true)
        } else if (is_subject_exam === '0') {
          setChecked(false)
        }
      } else if (subjectsParams.is_active) {
        paramsToRedirect.is_subject_exam = subjectsParams.is_subject_exam
        if (subjectsParams.is_subject_exam === '1') {
          setChecked(true)
        } else if (subjectsParams.is_subject_exam === '0') {
          setChecked(false)
        }
      }

      if (isPageChanged === false) {
        if (page !== null) {
          paramsToSet.page = page
          setPagination({ pageIndex: page, pageSize: 12 })
        } else if (subjectsParams.page) {
          paramsToRedirect.page = subjectsParams.page
          setPagination({ pageIndex: parseInt(subjectsParams.page as string), pageSize: 12 })
        } else if (page === null && !subjectsParams.page) {
          paramsToRedirect.page = 0
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('subjectsParams', paramsToSet)
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
  }, [classrooms_lite_list.loading, router, users_lite_list.loading])

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
      if (teacherQuery !== null) {
        urlParams['teacher_ids[]'] = teacherQuery.key
      }
      if (classroomsQuery.length !== 0) {
        urlParams['classroom_ids'] = classroomsQuery.map(classroom => classroom.key)
      }
      if (subjectsQuery.length !== 0) {
        urlParams['subject_names'] = subjectsQuery.map(subject => subject.name)
      }
      if (lessonHours?.length !== 0) {
        urlParams['week_hours'] = lessonHours
      }
      if (isSecondTeacherQuery) {
        urlParams['is_second_teacher'] = isSecondTeacherQuery
      }
      if (checked !== false) {
        urlParams['is_subject_exam'] = checked
      }
      if (sorting.length !== 0) {
        urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
      }
      const timeoutId = setTimeout(() => {
        dispatch(fetchSubjects(urlParams))
      }, 400)

      return () => clearTimeout(timeoutId)
    }
  }, [
    dispatch,
    searchValue,
    pagination,
    lessonHours,
    teacherQuery,
    classroomsQuery,
    subjectsQuery,
    checked,
    sorting,
    isSecondTeacherQuery,
    loadingQueries
  ])

  useEffect(() => {
    dispatch(fetchSettings({}))
  }, [dispatch])

  useEffect(() => {
    if (current_school !== null) {
      dispatch(
        fetchUsersLite({
          limit: 5000,
          offset: 0,
          role: 'teacher'
        })
      )
      dispatch(
        fetchClassroomsLite({
          limit: 200,
          offset: 0
        })
      )
    }
  }, [current_school, dispatch])

  useEffect(() => {
    if (
      !searchValue &&
      !teacherQuery &&
      classroomsQuery.length === 0 &&
      subjectsQuery.length === 0 &&
      !checked &&
      !lessonHours &&
      !isSecondTeacherQuery
    ) {
      setIsFiltered(false)
    } else {
      setIsFiltered(true)
    }
  }, [classroomsQuery, isSecondTeacherQuery, checked, lessonHours, searchValue, subjectsQuery.length, teacherQuery])

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
    setTeacherQuery(null)
    setClassroomsQuery([])
    setSubjectsQuery([])
    setLessonHours(null)
    setChecked(false)
    setIsSecondTeacherQuery(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '0')
    params.delete('search')
    params.delete('teacher_id')
    params.delete('classroom_ids')
    params.delete('subject_names')
    params.delete('week_hours')
    params.delete('is_subject_exam')
    params.delete('is_second_teacher')
    const contextParams = subjectsParams
    delete contextParams.search
    delete contextParams.teacher_id
    delete contextParams.classroom_ids
    delete contextParams.subject_names
    delete contextParams.week_hours
    delete contextParams.is_second_teacher
    delete contextParams.is_subject_exam
    setSearchParams('subjectsParams', contextParams)
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
      const contextParams = delete subjectsParams.search
      setSearchParams('subjectsParams', contextParams)
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterTeacher = (val: LiteModelType | null) => {
    setTeacherQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('teacher_id')

    const contextParams = delete subjectsParams.teacher_id
    setSearchParams('subjectsParams', contextParams)

    if (val) {
      params.set('teacher_id', val.key.toString())
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterClassroom = (val: LiteModelType[]) => {
    setClassroomsQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('classroom_ids')

    const contextParams = delete subjectsParams.classroom_ids
    setSearchParams('subjectsParams', contextParams)

    if (val.length > 0) {
      val.map((classroom: LiteModelType) => {
        params.append('classroom_ids', classroom.key.toString())
      })
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterSubject = (val: SubjectSettingsType[]) => {
    setSubjectsQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('subject_names')

    const contextParams = delete subjectsParams.subject_names
    setSearchParams('subjectsParams', contextParams)

    if (val.length > 0) {
      val.map((subject: SubjectSettingsType) => {
        params.append('subject_names', subject.name)
      })
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterWeekHours = (val: string | null) => {
    const arr = val && val.split('-').map(Number)
    setLessonHours(arr ? arr : null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('week_hours')

    const contextParams = delete subjectsParams.week_hours
    setSearchParams('subjectsParams', contextParams)

    if (arr && arr.length > 0) {
      arr.map((hour: number) => {
        params.append('week_hours', hour.toString())
      })
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleFilterSecondTeacher = (val: boolean) => {
    setIsSecondTeacherQuery(val)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('is_second_teacher')

    const contextParams = delete subjectsParams.is_second_teacher
    setSearchParams('subjectsParams', contextParams)

    if (val) {
      params.set('is_second_teacher', '1')
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleChangeHasExam = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('is_subject_exam')
    const contextParams = delete subjectsParams.is_active
    setSearchParams('subjectsParams', contextParams)
    if (event.target.checked) {
      params.set('is_subject_exam', '1')
    }
    params.set('page', '0')
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    setPagination({ pageIndex: 0, pageSize: 12 })
  }

  const handleShowDialog = async (arr?: string[]) => {
    const confirmed = await showDialog()
    if (confirmed) {
      if (arr) {
        handleDeleteSubject(arr)
      } else {
        handleDeleteSubject(Object.keys(rowSelection))
        setRowSelection({})
      }
    } else {
      setRowSelection({})
    }
  }

  const handleDeleteSubject = async (arr: string[]) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteSubject(arr))
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
        if (teacherQuery !== null) {
          urlParams['teacher_ids[]'] = teacherQuery.key
        }
        if (classroomsQuery.length !== 0) {
          urlParams['classroom_ids'] = classroomsQuery.map(classroom => classroom.key)
        }
        if (subjectsQuery.length !== 0) {
          urlParams['subject_names'] = subjectsQuery.map(classroom => classroom.name)
        }
        if (lessonHours?.length !== 0) {
          urlParams['week_hours'] = lessonHours
        }
        if (checked !== false) {
          urlParams['is_subject_exam'] = checked
        }
        if (isSecondTeacherQuery !== undefined) {
          urlParams['is_second_teacher'] = isSecondTeacherQuery
        }
        if (sorting.length !== 0) {
          urlParams['sort'] = sorting.map(sort => (sort.desc ? '-' + sort.id : sort.id))
        }
        if (urlParams['search']) {
          const timeoutId = setTimeout(() => {
            dispatch(fetchSubjects(urlParams))
          }, 400)

          return () => clearTimeout(timeoutId)
        } else {
          dispatch(fetchSubjects(urlParams))
        }
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const columns = useMemo<MRT_ColumnDef<SubjectType>[]>(
    () => [
      {
        accessorKey: 'name',
        accessorFn: row => row.name,
        id: 'name',
        header: t('Name'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography mr={2.5}>{row.original.name}</Typography>
            {row.original.classroom_type_key !== null && row.original.classroom_type_key > 0 ? (
              row.original.classroom?.sub_groups?.some(obj => obj.type === row.original.classroom_type) ? (
                <CustomChip
                  rounded
                  label={'Topar ' + row.original.classroom_type_key}
                  skin='light'
                  size='small'
                  color='info'
                />
              ) : (
                <CustomChip rounded label={''} skin='light' size='small' color='info' />
              )
            ) : (
              <CustomChip rounded label={t('All')} skin='light' size='small' color='info' />
            )}
          </Box>
        )
      },
      {
        accessorKey: 'classroom',
        accessorFn: row => row.classroom?.name,
        id: 'classroom',
        header: t('Classroom'),
        Cell: ({ row }) => (
          <Typography
            component={Link}
            href={`/classrooms/view/${row.original.classroom?.id}`}
            color={'primary.main'}
            sx={{ fontWeight: '600', textDecoration: 'none' }}
          >
            {row.original.classroom?.name}
          </Typography>
        )
      },
      {
        accessorKey: 'week_hours',
        accessorFn: row => row.week_hours,
        id: 'week_hours',
        header: t('LessonHours'),
        Cell: ({ row }) => (
          <Typography>
            {row.original.week_hours && (
              <CustomChip rounded label={row.original.week_hours + ' ' + t('NHours')} skin='light' color='secondary' />
            )}
          </Typography>
        )
      },
      {
        accessorKey: 'teacher',
        accessorFn: row => row.teacher?.last_name,
        id: 'teacher',
        header: t('Teacher'),
        Cell: ({ row }) => (
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
        accessorKey: 'second_teacher',
        accessorFn: row => row.second_teacher?.last_name,
        id: 'second_teacher',
        header: t('SecondTeacher'),
        Cell: ({ row }) => (
          <Typography
            component={Link}
            href={`/users/view/${row.original.second_teacher?.id}`}
            color={'primary.main'}
            sx={{ fontWeight: '600', textDecoration: 'none' }}
          >
            {renderUserFullname(
              row.original.second_teacher?.last_name,
              row.original.second_teacher?.first_name,
              row.original.second_teacher?.middle_name
            )}
          </Typography>
        )
      },
      {
        accessorKey: 'exam_teacher',
        accessorFn: row => row.exam?.head_teacher?.last_name,
        id: 'exam_teacher',
        header: t('ExamTeacher'),
        Cell: ({ row }) => (
          <Typography
            component={Link}
            href={`/users/view/${row.original.exam?.head_teacher?.id}`}
            color={'primary.main'}
            sx={{ fontWeight: '600', textDecoration: 'none' }}
          >
            {renderUserFullname(
              row.original.exam?.head_teacher?.last_name,
              row.original.exam?.head_teacher?.first_name,
              row.original.exam?.head_teacher?.middle_name
            )}
          </Typography>
        )
      },
      {
        accessorKey: 'exam_start_time',
        accessorFn: row => row.exam?.start_time,
        id: 'exam_start_time',
        header: t('StartTime'),
        Cell: ({ row }) => (
          <Typography>
            {row.original.exam?.start_time && format(new Date(row.original.exam?.start_time), 'dd.MM.yyyy HH:mm')}
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
    data: subjects_list.data,
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: subjects_list.error
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
        <Translations text='Total' /> {subjects_list.total}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/subjects/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
        <Button
          variant='tonal'
          size='small'
          color='success'
          component={Link}
          href={`/subjects/view/${row.original?.id}`}
          startIcon={<Icon icon='tabler:file-pencil' fontSize={20} />}
        >
          <Translations text='Exam' />
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
    rowCount: subjects_list.total,
    initialState: {
      columnVisibility: {
        second_teacher: false,
        exam_teacher: false,
        exam_start_time: false
      }
    },
    state: {
      density: 'compact',
      isLoading: subjects_list.loading || loadingQueries,
      pagination,
      rowSelection,
      sorting
    }
  })

  if (subjects_list.error) {
    return <Error error={subjects_list.error} />
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
                <Grid item xs={12} sm={9} md={6.5} lg={7.4} xl={7.4}>
                  <CustomTextField
                    fullWidth
                    value={searchValue}
                    ref={searchInputRef}
                    placeholder={t('SubjectSearch') as string}
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
                <Grid item xs={12} sm={3} md={2} lg={1.3} xl={1.3}>
                  <FormControlLabel
                    label={t('HasExam')}
                    control={<Checkbox checked={checked} onChange={handleChangeHasExam} name='is_subject_exam' />}
                  />
                </Grid>
                {ability.can('write', 'admin_subjects') ? (
                  <>
                    <Grid hidden={hidden} item xl={0.3}>
                      <Divider orientation='vertical' sx={{ m: 0, height: '85%' }} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={3.5} lg={3} xl={3}>
                      <ButtonGroup
                        variant='contained'
                        ref={anchorRef}
                        aria-label='split button'
                        sx={{ display: 'flex' }}
                      >
                        <Button
                          component={Link}
                          variant='contained'
                          fullWidth
                          href='/subjects/create'
                          startIcon={<Icon icon='tabler:plus' />}
                        >
                          <Translations text='AddSubject' />
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
                                  <MenuItem component={Link} href='/subjects/import'>
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
              usersStore={users_lite_list.data}
              settingsStore={settings}
              classroomStore={classrooms_lite_list.data}
              lessonHours={lessonHours}
              handleFilterWeekHours={handleFilterWeekHours}
              teacherQuery={teacherQuery}
              handleFilterTeacher={handleFilterTeacher}
              subjectsQuery={subjectsQuery}
              handleFilterSubject={handleFilterSubject}
              classroomsQuery={classroomsQuery}
              handleFilterClassroom={handleFilterClassroom}
              isSecondTeacherQuery={isSecondTeacherQuery}
              handleFilterSecondTeacher={handleFilterSecondTeacher}
            />
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

SubjectsList.acl = {
  action: 'read',
  subject: 'admin_subjects'
}

export default SubjectsList
