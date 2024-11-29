import {
  Box,
  Button,
  ButtonGroup,
  ButtonProps,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  styled,
  Theme,
  Typography,
  useMediaQuery
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import CustomTextField from 'src/shared/components/mui/text-field'
import DatePicker from 'react-datepicker'
import { ElementType, forwardRef, useState } from 'react'
import i18n from 'i18next'
import format from 'date-fns/format'
import Icon from 'src/shared/components/icon'
import CustomAvatar from 'src/shared/components/mui/avatar'
import Translations from 'src/app/layouts/components/Translations'
import { useAuth } from 'src/features/hooks/useAuth'
import { UserCreateType } from 'src/entities/school/UserType'
import { UserRolesType } from 'src/entities/school/UserSchoolType'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'
import { ErrorKeyType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { useRouter } from 'next/router'
import { errorTextHandler } from 'src/features/utils/api/errorHandler'

type PropsType = {
  errors: ErrorKeyType
  imgSrc: string
  inputValue: string
  handleInputImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleInputImageReset: () => void
  formData: UserCreateType
  handleFormChange: (field: any, val: any) => void
  mainSchool: LiteModelType | null
  handleUpdateMainSchool?: (val: LiteModelType | null) => void
  userSchools: UserRolesType
  handleAddUserSchools: (val: string) => void
}

type PickerProps = {
  error?: boolean
  helperText?: string
}

const CustomInput = forwardRef(({ ...props }: PickerProps, ref) => {
  return <CustomTextField fullWidth {...props} inputRef={ref} label={i18n.t('Birthday')} autoComplete='off' />
})

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  minWidth: 140,
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)<ButtonProps>(() => ({
  '& .MuiButton-startIcon': {
    margin: 0
  }
}))

const initialRoles = [
  {
    id: 1,
    name: 'admin',
    display_name: 'RoleAdmin'
  },
  {
    id: 2,
    name: 'organization',
    display_name: 'RoleOrganization'
  },
  {
    id: 3,
    name: 'operator',
    display_name: 'RoleOperator'
  },
  {
    id: 4,
    name: 'principal',
    display_name: 'RolePrincipal'
  },
  {
    id: 5,
    name: 'teacher',
    display_name: 'RoleTeacher'
  },
  {
    id: 6,
    name: 'parent',
    display_name: 'RoleParent'
  },
  {
    id: 7,
    name: 'student',
    display_name: 'RoleStudent'
  }
]

const checkButtonChecked = (role: string, userSchools: UserRolesType) => {
  if (userSchools.hasOwnProperty(role)) {
    return userSchools[role].some(item => item.is_delete !== true)
  }

  return false
}

const ProfileDataPanel = (props: PropsType) => {
  // ** State
  const errors = props.errors
  const imgSrc = props.imgSrc
  const inputValue = props.inputValue
  const handleInputImageChange = props.handleInputImageChange
  const handleInputImageReset = props.handleInputImageReset
  const formData = props.formData
  const handleFormChange = props.handleFormChange
  const mainSchool = props.mainSchool
  const handleUpdateMainSchool = props.handleUpdateMainSchool
  const userSchools = props.userSchools
  const handleAddUserSchools = props.handleAddUserSchools
  const [showPassword, setShowPassword] = useState<boolean>(false)

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const { current_role } = useAuth()
  const isFixedWidth = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)

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

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={12}>
        <Card
          sx={{
            mx: 'auto',
            ...(isFixedWidth && {
              maxWidth: 600
            })
          }}
        >
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
                alt={t('UserAvatarAlt') as string}
              />
              <Box display='flex' alignItems='center' gap={3} width='100%'>
                <ButtonStyled
                  component='label'
                  variant='tonal'
                  htmlFor='upload-image'
                  startIcon={<Icon icon='tabler:photo' />}
                >
                  <Translations text='Upload' />
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
                  onClick={handleInputImageReset}
                  startIcon={<Icon icon='tabler:trash' />}
                />
                <FormControl size='small' fullWidth>
                  <InputLabel id='status-filter-label'>
                    <Translations text='Status' />
                  </InputLabel>
                  <Select
                    label={t('Status')}
                    value={formData.status}
                    onChange={e => {
                      handleFormChange('status', e.target.value as string)
                    }}
                    id='status-filter'
                    labelId='status-filter-label'
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
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={12}>
        <Card
          sx={{
            mx: 'auto',
            ...(isFixedWidth && {
              maxWidth: 600
            })
          }}
        >
          <CardHeader title={t('ProfileInformation')} />
          <Divider />
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <Typography variant='h6' mb={1}>
                  <Translations text='SelectRoleWithComment' />
                </Typography>
                <ButtonGroup variant='outlined' fullWidth>
                  {rolesArr.slice(0, 4).map((row, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAddUserSchools(row.name)}
                      variant={checkButtonChecked(row.name, userSchools) ? 'contained' : 'outlined'}
                    >
                      <Translations text={row.display_name} />
                    </Button>
                  ))}
                </ButtonGroup>
                {rolesArr.slice(4, 8).length > 0 && (
                  <ButtonGroup variant='outlined' fullWidth sx={{ mt: 4 }}>
                    {rolesArr.slice(4, 8).map((row, index) => (
                      <Button
                        key={index}
                        onClick={() => handleAddUserSchools(row.name)}
                        variant={checkButtonChecked(row.name, userSchools) ? 'contained' : 'outlined'}
                      >
                        <Translations text={row.display_name} />
                      </Button>
                    ))}
                  </ButtonGroup>
                )}
                {errors && errors['role'] ? (
                  <Typography variant='body2' color='red'>
                    {errorTextHandler(errors['role'])}
                  </Typography>
                ) : null}
              </Grid>
              {Object.keys(userSchools).some(role =>
                ['operator', 'principal', 'teacher', 'student'].includes(role)
              ) && (
                <Grid item xs={12}>
                  <CustomAutocomplete
                    id='school'
                    value={mainSchool}
                    options={schools_lite_list.data}
                    loading={schools_lite_list.loading}
                    disabled={router.route.includes('edit')}
                    loadingText={t('ApiLoading')}
                    onChange={(e, v) => {
                      if (handleUpdateMainSchool && !router.route.includes('edit')) {
                        handleUpdateMainSchool(v)
                      }
                    }}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => (
                      <li {...props} key={item.key}>
                        <ListItemText>{item.value}</ListItemText>
                      </li>
                    )}
                    getOptionLabel={option => option.value || ''}
                    renderInput={params => <CustomTextField {...params} label={t('MainSchool')} />}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label={t('Surname')}
                  placeholder=''
                  value={formData.last_name}
                  onChange={e => handleFormChange('last_name', e.target.value)}
                  {...(errors && errors['last_name']
                    ? { error: true, helperText: errorTextHandler(errors['last_name']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label={t('Name')}
                  placeholder=''
                  required
                  value={formData.first_name}
                  onChange={e => handleFormChange('first_name', e.target.value)}
                  {...(errors && errors['first_name']
                    ? { error: true, helperText: errorTextHandler(errors['first_name']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label={t('FatherName')}
                  placeholder=''
                  value={formData.middle_name}
                  onChange={e => handleFormChange('middle_name', e.target.value)}
                  {...(errors && errors['middle_name']
                    ? { error: true, helperText: errorTextHandler(errors['middle_name']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  locale='tm'
                  autoComplete='off'
                  selected={formData?.birthday ? new Date(formData?.birthday) : null}
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
                  calendarStartDay={1}
                  onChange={(date: Date | null) => {
                    handleFormChange('birthday', date ? format(new Date(date), 'yyyy-MM-dd') : '')
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  type='text'
                  label={t('Phone')}
                  value={formData.phone}
                  placeholder=''
                  onChange={e => {
                    const input = e.target.value
                    if (!input || !isNaN((input as any) - parseFloat(input))) handleFormChange('phone', e.target.value)
                  }}
                  inputProps={{ maxLength: 8 }}
                  InputProps={{
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
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label={t('Username')}
                  placeholder=''
                  value={formData.username}
                  onChange={e => handleFormChange('username', e.target.value)}
                  InputProps={{
                    inputProps: { autoComplete: 'off' },
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
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label={t('Password')}
                  value={formData.password}
                  id='password'
                  required={
                    userSchools !== undefined
                      ? ['admin', 'organization', 'principal', 'operator'].every(key => userSchools.hasOwnProperty(key))
                        ? true
                        : false
                      : false
                  }
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
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProfileDataPanel
