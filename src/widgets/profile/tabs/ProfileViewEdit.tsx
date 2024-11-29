// ** React Imports
import { ElementType, forwardRef, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { CircularProgress, styled, Typography } from '@mui/material'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import Button, { ButtonProps } from '@mui/material/Button'

// ** Third party libraries
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'

// ** Custom Components Imports
import Icon from 'src/shared/components/icon'
import CustomAvatar from 'src/shared/components/mui/avatar'
import CustomTextField from 'src/shared/components/mui/text-field'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'

// ** Type Imports
import { DateType, ErrorKeyType, ErrorModelType } from 'src/entities/app/GeneralTypes'
import { UserCreateType, UserType } from 'src/entities/school/UserType'

// ** Store
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { updateProfile } from 'src/features/store/apps/profile'
import { convertProfileData } from 'src/features/utils/api/convertProfileData'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import format from 'date-fns/format'

const defaultValues: UserCreateType = {
  first_name: '',
  last_name: '',
  middle_name: '',
  status: '',
  username: '',
  birthday: '',
  gender: null,
  phone: '',
  email: '',
  address: '',
  work_title: '',
  work_place: '',
  district: '',
  reference: '',
  education_title: '',
  education_place: '',
  education_group: ''
}

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(2)
  }
}))

type PropsType = {
  error?: boolean
  helperText?: string
}

const CustomInput = forwardRef(({ ...props }: PropsType, ref) => {
  return (
    <CustomTextField
      fullWidth
      {...props}
      inputRef={ref}
      label='Doglan güni'
      autoComplete='off'
      InputProps={{ inputProps: { tabIndex: 6 } }}
    />
  )
})

interface ProfileViewProps {
  handleChangeEdit: () => void
}

const ProfileViewEdit = (props: ProfileViewProps) => {
  // ** State
  const [avatar, setAvatar] = useState<File>()
  const [date, setDate] = useState<DateType>(null)
  const [imgSrc, setImgSrc] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>('')
  const [avatarEdited, setAvatarEdited] = useState<boolean>(false)
  const [formData, setFormData] = useState<UserCreateType>(defaultValues)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { profile, profile_update } = useSelector((state: RootState) => state.profile)
  const data: UserType = (profile.data as { user: UserType }).user

  useEffect(() => {
    setFormData(convertProfileData(data))
    setImgSrc(data?.avatar)
    setDate(data?.birthday ? new Date(data?.birthday) : null)
    setAvatarEdited(false)
  }, [data])

  const handleInputImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarEdited(true)
    const selectedFiles = event.target.files as FileList
    setAvatar(selectedFiles?.[0] as File)

    const reader = new FileReader()
    const { files } = event.target as HTMLInputElement
    if (files && files.length !== 0) {
      reader.onload = () => {
        setImgSrc(reader.result as string)
      }
      reader.readAsDataURL(files[0])

      if (reader.result !== null) {
        setInputValue(reader.result as string)
      }
    }
  }

  const handleInputImageReset = () => {
    setAvatarEdited(true)
    setInputValue('')
    setImgSrc('')
    setAvatar(undefined)
  }

  const handleFormChange = (field: keyof UserCreateType, value: UserCreateType[keyof UserCreateType]) => {
    setFormData({ ...formData, [field]: value })
  }

  const onSubmit = (avatar: File, formData: UserCreateType) => {
    const formDataToSend = new FormData()
    for (const [key, value] of Object.entries(formData)) {
      if (value !== '' && value !== null && value !== undefined) {
        formDataToSend.append(key, value as any)
      }
    }
    if (avatarEdited !== false && avatar !== undefined) {
      formDataToSend.append('avatar', avatar as File)
    } else if (avatarEdited !== false && avatar === undefined) {
      formDataToSend.append('avatar_delete', '1')
    }

    dispatch(updateProfile(formDataToSend))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        props.handleChangeEdit()
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
      })
  }

  return (
    <DatePickerWrapper>
      <form
        autoComplete='off'
        onSubmit={e => {
          e.preventDefault()
          onSubmit(avatar as File, formData)
        }}
      >
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CustomAvatar
                    src={imgSrc}
                    sx={{
                      width: 100,
                      height: 100,
                      marginRight: theme => theme.spacing(6),
                      borderRadius: theme => theme.shape.borderRadius + 'px!important'
                    }}
                    alt={formData.first_name || ''}
                  />
                  <div>
                    <ButtonStyled
                      component='label'
                      variant='tonal'
                      htmlFor='upload-image'
                      tabIndex={1}
                      startIcon={<Icon icon='tabler:photo' />}
                    >
                      <Translations text='UploadAvatar' />
                      <input
                        hidden
                        type='file'
                        value={inputValue}
                        accept='image/png, image/jpeg'
                        onChange={handleInputImageChange}
                        id='upload-image'
                      />
                    </ButtonStyled>
                    <ResetButtonStyled
                      variant='tonal'
                      color='error'
                      tabIndex={2}
                      onClick={handleInputImageReset}
                      startIcon={<Icon icon='tabler:trash' />}
                    >
                      <Translations text='DeleteAvatar' />
                    </ResetButtonStyled>
                  </div>
                </Box>
              </CardContent>
              <Divider />
              <CardContent>
                <Grid container spacing={5}>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      label={t('Name')}
                      value={formData.first_name}
                      InputProps={{ inputProps: { tabIndex: 3 } }}
                      data-cy='profile-edit-first-name'
                      onChange={e => handleFormChange('first_name', e.target.value)}
                      {...(errors && errors['first_name']
                        ? { error: true, helperText: errorTextHandler(errors['first_name']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      label={t('Surname')}
                      value={formData.last_name}
                      InputProps={{ inputProps: { tabIndex: 4 } }}
                      data-cy='profile-edit-last-name'
                      onChange={e => handleFormChange('last_name', e.target.value)}
                      {...(errors && errors['last_name']
                        ? { error: true, helperText: errorTextHandler(errors['last_name']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      label={t('FatherName')}
                      value={formData.middle_name}
                      InputProps={{ inputProps: { tabIndex: 5 } }}
                      data-cy='profile-edit-middle-name'
                      onChange={e => handleFormChange('middle_name', e.target.value)}
                      {...(errors && errors['middle_name']
                        ? { error: true, helperText: errorTextHandler(errors['middle_name']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <DatePicker
                      locale='tm'
                      selected={date}
                      autoComplete='off'
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
                      data-cy='profile-edit-birthday'
                      id='birthday'
                      calendarStartDay={1}
                      onChange={(date: Date | null) => {
                        setDate(date)
                        handleFormChange('birthday', date ? format(new Date(date), 'yyyy-MM-dd') : '')
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      select
                      required
                      fullWidth
                      id='profile-gender'
                      defaultValue=''
                      InputProps={{ inputProps: { tabIndex: 7 } }}
                      label={t('Gender')}
                      data-cy='profile-edit-gender'
                      SelectProps={{
                        value: formData.gender,
                        onChange: e => handleFormChange('gender', e.target.value as string)
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
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      type='email'
                      label={t('Email')}
                      value={formData.email}
                      data-cy='profile-edit-email'
                      InputProps={{ inputProps: { tabIndex: 8 } }}
                      placeholder=''
                      onChange={e => handleFormChange('email', e.target.value)}
                      {...(errors && errors['email']
                        ? { error: true, helperText: errorTextHandler(errors['email']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      type='text'
                      label={t('Phone')}
                      value={formData.phone}
                      placeholder=''
                      data-cy='profile-edit-phone'
                      onChange={e => {
                        const input = e.target.value
                        if (!input || !isNaN((input as any) - parseFloat(input)))
                          handleFormChange('phone', e.target.value)
                      }}
                      inputProps={{ maxLength: 8 }}
                      InputProps={{
                        inputProps: { tabIndex: 9 },
                        startAdornment: <InputAdornment position='start'>+993</InputAdornment>
                      }}
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
                                      currentParams.set('search', formData.phone || '')

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
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      label={t('Username')}
                      placeholder=''
                      data-cy='profile-edit-username'
                      value={formData.username}
                      onChange={e => handleFormChange('username', e.target.value)}
                      InputProps={{
                        inputProps: { tabIndex: 10 },
                        startAdornment: <InputAdornment position='start'>@</InputAdornment>
                      }}
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
                                      currentParams.set('search', formData.username || '')

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
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      select
                      fullWidth
                      defaultValue=''
                      label={t('Status')}
                      data-cy='profile-edit-status'
                      InputProps={{ inputProps: { tabIndex: 11 } }}
                      SelectProps={{
                        value: formData.status,
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
                  <Grid item xs={12} sm={12}>
                    <CustomTextField
                      fullWidth
                      label={t('Address')}
                      placeholder=''
                      data-cy='profile-edit-address'
                      value={formData.address}
                      InputProps={{ inputProps: { tabIndex: 12 } }}
                      onChange={e => handleFormChange('address', e.target.value)}
                      {...(errors && errors['address']
                        ? { error: true, helperText: errorTextHandler(errors['address']) }
                        : null)}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} textAlign={'right'} sx={{ pt: theme => `${theme.spacing(6.5)} !important` }}>
                  <Button variant='contained' type='submit' sx={{ mr: 4 }} disabled={profile_update.loading}>
                    {profile_update.loading ? (
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
                      props.handleChangeEdit()
                    }}
                  >
                    <Translations text='GoBack' />
                  </Button>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </DatePickerWrapper>
  )
}

export default ProfileViewEdit
