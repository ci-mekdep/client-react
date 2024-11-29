import { ReactElement, Ref, forwardRef, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'

// ** Custom Components Import
import CustomChip from 'src/shared/components/mui/chip'
import CustomAvatar from 'src/shared/components/mui/avatar'
import CustomTextField from 'src/shared/components/mui/text-field'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import { UserCreateType, UserListType } from 'src/entities/school/UserType'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Fade,
  FadeProps,
  Grid,
  IconButton,
  IconButtonProps,
  InputAdornment,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  styled
} from '@mui/material'
import { ThemeColor } from 'src/shared/layouts/types'
import { getInitials } from 'src/shared/utils/get-initials'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { renderUsername } from 'src/features/utils/ui/renderUsername'
import { DateType, ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { useTranslation } from 'react-i18next'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { addUser, fetchUsersLite } from 'src/features/store/apps/user'
import { getCurrentClassroom, updateClassroomRelations } from 'src/features/store/apps/classrooms'
import { ClassroomCreateType, ClassroomType } from 'src/entities/classroom/ClassroomType'
import Link from 'next/link'
import Icon from 'src/shared/components/icon'
import Translations from 'src/app/layouts/components/Translations'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import { useDialog } from 'src/app/context/DialogContext'
import i18n from 'i18next'
import format from 'date-fns/format'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import isAfter from 'date-fns/isAfter'
import subDays from 'date-fns/subDays'
import { renderPhone } from 'src/features/utils/ui/renderPhone'

interface PropsType {
  id: string
  data: ClassroomType | null
  selectedStudents: LiteModelType[] | null
  setSelectedStudents: (value: LiteModelType[] | null) => void
}

const defaultValues: UserCreateType = {
  first_name: '',
  status: 'active',
  username: '',
  birthday: '',
  gender: null
}

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

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

type InputPropsType = {
  error?: boolean
  helperText?: string
}

const CustomInput = forwardRef(({ ...props }: InputPropsType, ref) => {
  return <CustomTextField fullWidth {...props} inputRef={ref} label={i18n.t('Birthday')} autoComplete='off' />
})

// ** renders client column
const renderAvatar = (row: UserListType) => {
  if (row.avatar) {
    return <CustomAvatar src={row.avatar} sx={{ mr: 2.5, width: 28, height: 28 }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color={'primary' as ThemeColor}
        sx={{ mr: 2.5, width: 28, height: 28, fontWeight: 500, fontSize: theme => theme.typography.body2.fontSize }}
      >
        {getInitials(renderUserFullname(row.last_name, row.first_name, null) || 'Aman Amanow')}
      </CustomAvatar>
    )
  }
}

const ClassroomStudentsCard = (props: PropsType) => {
  const { id, data, selectedStudents, setSelectedStudents } = props

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [show, setShow] = useState<boolean>(false)
  const [show2, setShow2] = useState<boolean>(false)

  const [date, setDate] = useState<DateType>(null)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [activeParents, setActiveParents] = useState<LiteModelType[]>([])
  const [userFormData, setUserFormData] = useState<UserCreateType>(defaultValues)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  const [students, setStudents] = useState<LiteModelType[]>([])
  const [parents, setParents] = useState<LiteModelType[]>([])

  // ** Hooks
  const showDialog = useDialog()
  const { t } = useTranslation()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { users_lite_list } = useSelector((state: RootState) => state.user)

  const fetchStudents = async () => {
    const params: any = {
      limit: 5000,
      offset: 0,
      role: 'student',
      no_classroom: 'true'
    }
    if (data?.school_id) {
      params.school_id = data.school_id
    }
    dispatch(fetchUsersLite(params))
      .then(res => {
        setStudents(res.payload.users)
      })
      .catch(err => {
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const fetchParents = async () => {
    const params: any = {
      limit: 5000,
      offset: 0,
      role: 'parent'
    }
    if (data?.school_id) {
      params.school_id = data.school_id
    }
    dispatch(fetchUsersLite(params))
      .then(res => {
        setParents(res.payload.users)
      })
      .catch(err => {
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  useEffect(() => {
    if (show === true) {
      fetchParents()
      fetchStudents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  const handleStudents = (e: any, v: LiteModelType[] | null) => {
    setSelectedStudents(v)
  }

  const handleFormChange = (field: keyof UserCreateType, value: UserCreateType[keyof UserCreateType]) => {
    setUserFormData({ ...userFormData, [field]: value })
  }

  const onSubmit = (formData: UserCreateType) => {
    setIsSubmitting(true)
    const dataToSend = formData

    dataToSend.schools = [{ role_code: 'student', school_id: data?.school?.id || null }]
    dataToSend.classrooms = [{ type: null, type_key: null, classroom_id: data?.id || '' }]
    if (activeParents.length > 0) {
      const parentIds = activeParents.map(parent => parent.key)
      dataToSend.parent_ids = parentIds
    }

    dispatch(addUser(dataToSend))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        setShow(false)
        setShow2(false)
        setIsSubmitting(false)
        setUserFormData(defaultValues)
        dispatch(getCurrentClassroom(id))
      })
      .catch(err => {
        const errorObject: ErrorKeyType = {}
        err.errors?.map((err: ErrorModelType) => {
          if (err.key && err.code) {
            errorObject[err.key] = err.code
          }
        })
        setErrors(errorObject)
        toast.error(errorHandler(err), {
          duration: 2000
        })
        setIsSubmitting(false)
      })
  }

  const handleShowDialog = async (arr: string) => {
    const confirmed = await showDialog()
    if (confirmed) {
      handleRemoveStudents(arr)
    }
  }

  const handleRemoveStudents = (row_id: string) => {
    setIsSubmitting(true)
    const dataT: ClassroomCreateType = {}
    dataT.student_ids = data?.students
      .filter(function (obj) {
        return obj.id !== row_id
      })
      ?.map(s => s.id)
    setShow(false)
    setShow2(false)
    dispatch(updateClassroomRelations({ data: dataT, id: data?.id as string }))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'))
        dispatch(getCurrentClassroom(id))
      })
      .catch(err => {
        toast.error(errorHandler(err), {
          duration: 2000
        })
        setIsSubmitting(false)
      })
  }

  const handleAddStudents = () => {
    setIsSubmitting(true)
    const dataT: ClassroomCreateType = {}
    dataT.student_ids = selectedStudents?.map(s => s.key)
    setShow(false)
    setShow2(false)
    dispatch(updateClassroomRelations({ data: dataT, id: data?.id as string }))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'))
        dispatch(getCurrentClassroom(id))
      })
      .catch(err => {
        toast.error(errorHandler(err), {
          duration: 2000
        })
        setIsSubmitting(false)
      })
  }

  const columns = useMemo<MRT_ColumnDef<UserListType>[]>(
    () => [
      {
        accessorKey: 'name',
        accessorFn: row => row.last_name,
        id: 'name',
        header: t('Fullname'),
        sortingFn: 'customSorting',
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderAvatar(row.original)}
            <Typography sx={{ color: 'text.secondary', fontWeight: 600, mr: 2.5 }}>
              {renderUserFullname(row.original.last_name, row.original.first_name, row.original.middle_name)}
            </Typography>
            {row.original.is_new === true && (
              <CustomChip rounded label={t('NoSubgroup')} skin='light' size='small' color='warning' />
            )}
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
        sortingFn: 'customSorting',
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
        accessorKey: 'birthday',
        accessorFn: row => row.birthday,
        id: 'birthday',
        header: t('Birthday'),
        Cell: ({ row }) => (
          <Typography>{row.original.birthday && format(new Date(row.original.birthday), 'dd.MM.yyyy')}</Typography>
        )
      }
    ],
    [t]
  )

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableSorting: true,
    enableRowActions: true,
    enableRowNumbers: true,
    enableStickyHeader: true,
    enableHiding: false,
    enableEditing: false,
    enableGrouping: false,
    enablePagination: false,
    enableRowSelection: false,
    enableGlobalFilter: false,
    enableStickyFooter: false,
    enableDensityToggle: false,
    renderBottomToolbar: false,
    enableColumnPinning: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    renderTopToolbar: false,
    muiTableBodyCellProps: {
      padding: 'none'
    },
    muiTablePaperProps: {
      sx: {
        borderRadius: '0',
        boxShadow: 'none!important'
      }
    },
    muiTableContainerProps: {
      sx: { maxHeight: 'none' }
    },
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 120,
        grow: false
      }
    },
    positionActionsColumn: 'last',
    columns,
    data: data?.students ? data?.students : [],
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              handleShowDialog(row.original.id)
            }}
            startIcon={<Icon icon='tabler:trash' fontSize={20} />}
          >
            <Translations text='Delete' />
          </Button>
        ) : null}
      </Box>
    ),
    state: {
      density: 'compact'
    }
  })

  return (
    <>
      <Dialog
        fullWidth
        open={show}
        maxWidth='md'
        scroll='body'
        onClose={() => setShow(false)}
        TransitionComponent={Transition}
        onBackdropClick={() => setShow(false)}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogContent
          sx={{
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            py: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <CustomCloseButton onClick={() => setShow(false)}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <Typography variant='h4' sx={{ mb: 4, textAlign: 'center' }}>
            <Translations text='AddStudent' /> ({data && data.name})
          </Typography>
          <Grid container spacing={6}>
            <Grid item xs={12} lg={12}>
              <CustomAutocomplete
                id='students'
                size='small'
                multiple
                fullWidth
                options={students}
                value={selectedStudents as LiteModelType[]}
                onChange={handleStudents}
                disableCloseOnSelect={true}
                filterSelectedOptions
                isOptionEqualToValue={(option, value) => option.key === value.key}
                getOptionLabel={option => option.value || ''}
                noOptionsText={t('NoRows')}
                loading={users_lite_list.loading}
                loadingText={t('ApiLoading')}
                renderOption={(props, item) => (
                  <li {...props} key={item.key}>
                    <ListItemText>{item.value}</ListItemText>
                  </li>
                )}
                renderInput={params => <TextField {...params} label={t('SelectStudent')} />}
                renderTags={(value: LiteModelType[], getTagProps) =>
                  value.map((option: LiteModelType, index: number) => (
                    <CustomChip
                      rounded
                      skin='light'
                      color='primary'
                      sx={{ m: 0.5 }}
                      label={option.value}
                      {...(getTagProps({ index }) as {})}
                      key={index}
                    />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12} lg={12} textAlign={'center'}>
              <Button
                variant='contained'
                onClick={() => setShow2(true)}
                startIcon={<Icon icon='tabler:plus' fontSize={20} />}
              >
                <Translations text='NewStudent' />
              </Button>
            </Grid>
          </Grid>
          <Box sx={{ pt: theme => `${theme.spacing(6.5)} !important`, textAlign: 'center' }}>
            <Button
              variant='contained'
              type='submit'
              onClick={handleAddStudents}
              sx={{ mr: 4 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress
                  sx={{
                    width: '20px !important',
                    height: '20px !important',
                    mr: theme => theme.spacing(2)
                  }}
                />
              ) : null}
              <Translations text='Submit' />
            </Button>
            <Button variant='tonal' color='secondary' onClick={() => setShow(false)}>
              <Translations text='GoBack' />
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        fullWidth
        open={show2}
        maxWidth='md'
        scroll='body'
        onClose={() => setShow2(false)}
        TransitionComponent={Transition}
        onBackdropClick={() => setShow2(false)}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <form
          autoComplete='off'
          onSubmit={e => {
            e.preventDefault()
            onSubmit(userFormData)
          }}
        >
          <DialogContent
            sx={{
              pb: theme => `${theme.spacing(8)} !important`,
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <CustomCloseButton onClick={() => setShow2(false)}>
              <Icon icon='tabler:x' fontSize='1.25rem' />
            </CustomCloseButton>
            <Typography variant='h3' textAlign={'center'} fontWeight={600} sx={{ mb: 8 }}>
              <Translations text='AddStudent' />
            </Typography>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label={t('Name')}
                  placeholder=''
                  value={userFormData.first_name}
                  onChange={e => handleFormChange('first_name', e.target.value)}
                  {...(errors && errors['first_name']
                    ? { error: true, helperText: errorTextHandler(errors['first_name']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label={t('Surname')}
                  placeholder=''
                  value={userFormData.last_name}
                  onChange={e => handleFormChange('last_name', e.target.value)}
                  {...(errors && errors['last_name']
                    ? { error: true, helperText: errorTextHandler(errors['last_name']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label={t('FatherName')}
                  placeholder=''
                  value={userFormData.middle_name}
                  onChange={e => handleFormChange('middle_name', e.target.value)}
                  {...(errors && errors['middle_name']
                    ? { error: true, helperText: errorTextHandler(errors['middle_name']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePickerWrapper>
                  <DatePicker
                    locale='tm'
                    autoComplete='off'
                    calendarStartDay={1}
                    selected={date}
                    dateFormat='dd.MM.yyyy'
                    showYearDropdown
                    showMonthDropdown
                    preventOpenOnFocus
                    placeholderText='DD.MM.YYYY'
                    customInput={
                      <CustomInput
                        {...(errors && errors['birthday']
                          ? { error: true, helperText: errorTextHandler(errors['birthday']) }
                          : null)}
                      />
                    }
                    id='birthday'
                    onChange={(date: Date | null) => {
                      setDate(date)
                      handleFormChange('birthday', date ? format(new Date(date), 'yyyy-MM-dd') : '')
                    }}
                  />
                </DatePickerWrapper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  required
                  fullWidth
                  defaultValue=''
                  label={t('Gender')}
                  SelectProps={{
                    value: userFormData.gender,
                    onChange: e => handleFormChange('gender', parseInt(e.target.value as string))
                  }}
                  {...(errors && errors['gender']
                    ? { error: true, helperText: errorTextHandler(errors['gender']) }
                    : null)}
                >
                  <MenuItem value='1'>
                    <Translations text='GenderMale' />
                  </MenuItem>
                  <MenuItem value='2'>
                    <Translations text='GenderFemale' />
                  </MenuItem>
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label={t('Password')}
                  value={userFormData.password}
                  id='password'
                  onChange={e => handleFormChange('password', e.target.value as string)}
                  type={showPassword ? 'text' : 'password'}
                  InputProps={{
                    inputProps: { autoComplete: 'new-password' },
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => {
                            setShowPassword(current => !current)
                          }}
                          onMouseDown={e => e.preventDefault()}
                          aria-label='toggle password visibility'
                        >
                          <Icon fontSize='1.25rem' icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  {...(errors && errors['password']
                    ? { error: true, helperText: errorTextHandler(errors['password']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  type='email'
                  label={t('Email')}
                  value={userFormData.email}
                  placeholder=''
                  onChange={e => handleFormChange('email', e.target.value)}
                  {...(errors && errors['email']
                    ? { error: true, helperText: errorTextHandler(errors['email']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  type='text'
                  label={t('Phone')}
                  value={userFormData.phone}
                  placeholder=''
                  onChange={e => {
                    const input = e.target.value
                    if (!input || !isNaN((input as any) - parseFloat(input))) handleFormChange('phone', e.target.value)
                  }}
                  inputProps={{ maxLength: 8 }}
                  InputProps={{ startAdornment: <InputAdornment position='start'>+993</InputAdornment> }}
                  {...(errors && errors['phone']
                    ? {
                        error: true,
                        helperText:
                          errors['phone'] === 'unique' ? (
                            <Box display='flex' gap={1}>
                              <Typography variant='body2' color='error.main'>
                                {errorTextHandler(errors['phone'])}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='error.main'
                                sx={{ cursor: 'pointer', fontWeight: 600 }}
                                onClick={() => {
                                  const currentParams = new URLSearchParams(window.location.search)

                                  currentParams.set('page', '0')
                                  currentParams.set('search', userFormData.phone || '')

                                  const newUrl = `/users?${currentParams.toString()}`
                                  window.open(newUrl, '_blank')
                                }}
                              >
                                <Translations text='ShowDuplicates' />
                              </Typography>
                            </Box>
                          ) : (
                            errorTextHandler(errors['phone'])
                          )
                      }
                    : null)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label={t('Username')}
                  placeholder=''
                  value={userFormData.username}
                  onChange={e => handleFormChange('username', e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position='start'>@</InputAdornment> }}
                  {...(errors && errors['username']
                    ? {
                        error: true,
                        helperText:
                          errors['username'] === 'unique' ? (
                            <Box display='flex' gap={1}>
                              <Typography variant='body2' color='error.main'>
                                {errorTextHandler(errors['username'])}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='error.main'
                                sx={{ cursor: 'pointer', fontWeight: 600 }}
                                onClick={() => {
                                  const currentParams = new URLSearchParams(window.location.search)

                                  currentParams.set('page', '0')
                                  currentParams.set('search', userFormData.username || '')

                                  const newUrl = `/users?${currentParams.toString()}`
                                  window.open(newUrl, '_blank')
                                }}
                              >
                                <Translations text='ShowDuplicates' />
                              </Typography>
                            </Box>
                          ) : (
                            errorTextHandler(errors['username'])
                          )
                      }
                    : null)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  fullWidth
                  defaultValue=''
                  label={t('Status')}
                  SelectProps={{
                    value: userFormData.status,
                    onChange: e => handleFormChange('status', e.target.value as string)
                  }}
                  {...(errors && errors['status']
                    ? { error: true, helperText: errorTextHandler(errors['status']) }
                    : null)}
                >
                  <MenuItem value='active'>
                    <Translations text='StatusActive' />
                  </MenuItem>
                  <MenuItem value='wait'>
                    <Translations text='StatusWaiting' />
                  </MenuItem>
                  <MenuItem value='blocked'>
                    <Translations text='StatusBlocked' />
                  </MenuItem>
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label={t('Address')}
                  placeholder=''
                  value={userFormData.address}
                  onChange={e => handleFormChange('address', e.target.value)}
                  {...(errors && errors['address']
                    ? { error: true, helperText: errorTextHandler(errors['address']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label={t('Classroom')}
                  fullWidth
                  defaultValue={data?.name}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <CustomAutocomplete
                  multiple
                  value={activeParents}
                  options={parents}
                  disableCloseOnSelect={true}
                  isOptionEqualToValue={(option, value) => option.key === value.key}
                  onChange={(e: any, v: LiteModelType[]) => {
                    setActiveParents(v)
                  }}
                  id='parents'
                  noOptionsText={t('NoRows')}
                  renderOption={(props, item) => (
                    <li {...props} key={item.key}>
                      <ListItemText>{item.value}</ListItemText>
                    </li>
                  )}
                  getOptionLabel={option => option.value || ''}
                  renderInput={params => <CustomTextField {...params} label={t('Parents')} />}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: 'center',
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <Button variant='contained' type='submit' sx={{ mr: 4 }} disabled={isSubmitting}>
              {isSubmitting ? (
                <CircularProgress
                  sx={{
                    width: '20px !important',
                    height: '20px !important',
                    mr: theme => theme.spacing(2)
                  }}
                />
              ) : null}
              <Translations text='Submit' />
            </Button>
            <Button
              variant='tonal'
              color='secondary'
              onClick={() => {
                setShow2(false)
              }}
            >
              <Translations text='GoBack' />
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={t('StudentsOfClassroom')}
            action={
              ability.can('write', 'admin_classrooms') ? (
                <Button
                  variant='tonal'
                  onClick={() => setShow(true)}
                  startIcon={<Icon icon='tabler:plus' fontSize={20} />}
                >
                  <Translations text='AddStudent' />
                </Button>
              ) : null
            }
          />
          <Divider />
          <CardContent sx={{ p: '0!important' }}>
            <MaterialReactTable table={table} />
          </CardContent>
        </Card>
      </Grid>
    </>
  )
}

export default ClassroomStudentsCard
