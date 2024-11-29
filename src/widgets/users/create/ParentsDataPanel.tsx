import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  ListItemText,
  Typography
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { forwardRef, SyntheticEvent, useEffect, useMemo } from 'react'
import Icon from 'src/shared/components/icon'
import { UserParentsType, UserRolesType } from 'src/entities/school/UserSchoolType'
import Translations from 'src/app/layouts/components/Translations'
import CustomTextField from 'src/shared/components/mui/text-field'
import i18n from 'i18next'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import DatePicker from 'react-datepicker'
import format from 'date-fns/format'
import { UserCreateType, UserListType } from 'src/entities/school/UserType'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import debounce from 'lodash/debounce'
import { fetchUsers } from 'src/features/store/apps/user'
import CustomAvatar from 'src/shared/components/mui/avatar'
import { ErrorKeyType } from 'src/entities/app/GeneralTypes'
import { errorTextHandler } from 'src/features/utils/api/errorHandler'

type SchoolUserType = {
  [key: string]: UserListType[]
}

type PropsType = {
  errors: ErrorKeyType
  imgSrc: string
  formData: UserCreateType
  userSchools: UserRolesType
  userParents: UserParentsType[]
  parentOptions: SchoolUserType
  handleUpdateParentOptions: (key: string, val: UserListType[], del: boolean) => void
  handleDeleteParent: (index: number) => void
  handleAddParent: (obj: UserParentsType) => void
  handleUpdateParent: (index: number, obj: any) => void
  handleSelectParent: (index: number, parent: string | UserListType | null) => void
  handleUpdateUserParents: (obj: UserParentsType) => void
}

const getRandomId = () => Math.floor(Math.random() * 10000)

type PickerProps = {
  error?: boolean
  helperText?: string
}

const CustomInput = forwardRef(({ ...props }: PickerProps, ref) => {
  return <CustomTextField fullWidth {...props} inputRef={ref} label={i18n.t('Birthday')} autoComplete='off' />
})

const defaultParentObj = {
  first_name: '',
  last_name: '',
  middle_name: '',
  status: 'active',
  birthday: null,
  gender: null
}

const ParentsDataPanel = (props: PropsType) => {
  // ** State
  const errors = props.errors
  const imgSrc = props.imgSrc
  const formData = props.formData
  const userParents = props.userParents
  const parentOptions = props.parentOptions
  const handleUpdateParentOptions = props.handleUpdateParentOptions
  const handleDeleteParent = props.handleDeleteParent
  const handleAddParent = props.handleAddParent
  const handleUpdateParent = props.handleUpdateParent
  const handleSelectParent = props.handleSelectParent
  const handleUpdateUserParents = props.handleUpdateUserParents

  // ** Hooks
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { users_list } = useSelector((state: RootState) => state.user)

  const handleFetchParents = (schoolKey: string, newInputValue: string) => {
    dispatch(fetchUsers({ limit: 100, offset: 0, role: 'parent', school_id: schoolKey, search: newInputValue }))
      .unwrap()
      .then(res => {
        handleUpdateParentOptions(schoolKey, res.users, false)
      })
      .catch(err => {
        console.log(err)
      })
  }

  const debouncedFetch = useMemo(
    () =>
      debounce((schoolKey: string, newInputValue: string) => {
        handleFetchParents(schoolKey, newInputValue)
      }, 400),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    return () => {
      debouncedFetch.cancel()
    }
  }, [debouncedFetch])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                <Box padding={4}>
                  <Typography display={'flex'} alignItems='center' sx={{ mb: 3, gap: 3, fontSize: 21 }}>
                    {renderUserFullname(formData.last_name, formData.first_name, formData.middle_name)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={12}>
        <Card>
          <CardHeader
            title={t('Parents')}
            action={
              <Button
                fullWidth
                color='primary'
                variant='tonal'
                sx={{ minWidth: 190 }}
                startIcon={<Icon icon='tabler:plus' />}
                onClick={() => {
                  const parentObj = {
                    index: getRandomId(),
                    parent: defaultParentObj,
                    selected_parent: null,
                    parent_options: [],
                    school: null
                  }
                  handleAddParent(parentObj)
                }}
              >
                <Translations text='AddParent' />
              </Button>
            }
          />
        </Card>
      </Grid>
      {userParents.map((userParent, index) => (
        <Grid key={index} item xs={12} sm={12}>
          <Card>
            <CardHeader
              title={t('Parent') + ` ${index + 1}`}
              action={
                <Button
                  variant='tonal'
                  color='error'
                  size='medium'
                  onClick={() => {
                    handleDeleteParent(userParent.index)
                    if (userParent.school) {
                      handleUpdateParentOptions(userParent.school?.key, [], true)
                    }
                  }}
                  startIcon={<Icon icon='tabler:trash' fontSize={20} />}
                >
                  <Translations text='Delete' />
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <CustomAutocomplete
                    id='school'
                    value={userParent?.school}
                    options={schools_lite_list.data}
                    loading={schools_lite_list.loading}
                    loadingText={t('ApiLoading')}
                    onChange={(e, v) => {
                      const parentObj = { ...userParent, school: v }
                      handleUpdateUserParents(parentObj)
                      if (v) {
                        handleUpdateParentOptions(v.key, [], false)
                      } else if (userParent.school) {
                        handleUpdateParentOptions(userParent.school.key, [], true)
                      }
                    }}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => (
                      <li {...props} key={item.key}>
                        <ListItemText>{item.value}</ListItemText>
                      </li>
                    )}
                    getOptionLabel={option => option.value || ''}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        {...(errors && errors[`parents.${index}.schools.0.school_id`]
                          ? { error: true, helperText: errorTextHandler(errors[`parents.${index}.schools.0.school_id`]) }
                          : null)}
                        label={t('School')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <CustomTextField
                    fullWidth
                    type='text'
                    label={t('Phone')}
                    value={userParent.parent?.phone || ''}
                    placeholder=''
                    onChange={e => {
                      const input = e.target.value
                      if (!input || !isNaN((input as any) - parseFloat(input))) {
                        const parentObj = {
                          ...userParent.parent,
                          phone: input
                        }
                        handleUpdateParent(userParent.index, parentObj)
                      }
                    }}
                    inputProps={{ maxLength: 8 }}
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>+993</InputAdornment>
                    }}
                    {...(errors && errors[`parents.${index}.phone`]
                      ? { error: true, helperText: errorTextHandler(errors[`parents.${index}.phone`]) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <DatePicker
                    locale='tm'
                    autoComplete='off'
                    selected={userParent.parent?.birthday ? new Date(userParent.parent?.birthday) : null}
                    dateFormat='dd.MM.yyyy'
                    showYearDropdown
                    showMonthDropdown
                    preventOpenOnFocus
                    placeholderText='DD.MM.YYYY'
                    customInput={
                      <CustomInput
                        {...(errors && errors[`parents.${index}.birthday`]
                          ? { error: true, helperText: errorTextHandler(errors[`parents.${index}.birthday`]) }
                          : null)}
                      />
                    }
                    id='birthday'
                    calendarStartDay={1}
                    onChange={(date: Date | null) => {
                      const parentObj = {
                        ...userParent.parent,
                        birthday: date ? format(new Date(date), 'yyyy-MM-dd') : ''
                      }
                      handleUpdateParent(userParent.index, parentObj)
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <CustomAutocomplete
                    id='surname'
                    freeSolo
                    autoComplete
                    value={userParent?.selected_parent}
                    options={userParent?.school?.key ? parentOptions[userParent.school.key] : []}
                    filterOptions={x => x}
                    loading={users_list.loading}
                    loadingText={t('ApiLoading')}
                    onInputChange={(event, newInputValue) => {
                      if (newInputValue && userParent?.school?.key) {
                        debouncedFetch(userParent.school.key, newInputValue)
                      }

                      const parentObj = {
                        ...userParent?.parent,
                        last_name: newInputValue
                      }
                      handleUpdateParent(userParent.index, parentObj)
                    }}
                    onChange={(event: SyntheticEvent, newValue: string | UserListType | null) => {
                      if (typeof newValue !== 'string') {
                        const parentObj = {
                          id: newValue?.id || null,
                          first_name: newValue?.first_name || null,
                          last_name: newValue?.last_name || null,
                          middle_name: newValue?.middle_name || null,
                          phone: newValue?.phone || null,
                          birthday: newValue?.birthday ? format(new Date(newValue?.birthday), 'yyyy-MM-dd') : '',
                          status: newValue?.status || null
                        }
                        handleUpdateParent(userParent.index, parentObj)
                        handleSelectParent(userParent.index, newValue)
                      } else {
                        const parentObj = {
                          ...userParent?.parent,
                          id: null,
                          last_name: newValue
                        }
                        handleUpdateParent(userParent.index, parentObj)
                        handleSelectParent(userParent.index, newValue)
                      }
                    }}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => {
                      if (typeof item === 'string') {
                        return (
                          <li {...props} key={item}>
                            <ListItemText>{item}</ListItemText>
                          </li>
                        )
                      } else {
                        return (
                          <li {...props} key={item.id}>
                            <ListItemText>
                              {renderUserFullname(item?.last_name, item?.first_name, item?.middle_name)}
                            </ListItemText>
                          </li>
                        )
                      }
                    }}
                    getOptionLabel={option => (typeof option === 'string' ? option : option.last_name)}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        {...(errors && errors[`parents.${index}.last_name`]
                          ? { error: true, helperText: errorTextHandler(errors[`parents.${index}.last_name`]) }
                          : null)}
                        label={t('Surname')}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {users_list.loading ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <CustomTextField
                    fullWidth
                    label={t('Name')}
                    placeholder=''
                    value={userParent.parent?.first_name || ''}
                    onChange={e => {
                      const parentObj = {
                        ...userParent.parent,
                        first_name: e.target.value
                      }
                      handleUpdateParent(userParent.index, parentObj)
                    }}
                    {...(errors && errors[`parents.${index}.first_name`]
                      ? { error: true, helperText: errorTextHandler(errors[`parents.${index}.first_name`]) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <CustomTextField
                    fullWidth
                    label={t('FatherName')}
                    placeholder=''
                    value={userParent.parent?.middle_name || ''}
                    onChange={e => {
                      const parentObj = {
                        ...userParent.parent,
                        middle_name: e.target.value
                      }
                      handleUpdateParent(userParent.index, parentObj)
                    }}
                    {...(errors && errors[`parents.${index}.middle_name`]
                      ? { error: true, helperText: errorTextHandler(errors[`parents.${index}.middle_name`]) }
                      : null)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default ParentsDataPanel
