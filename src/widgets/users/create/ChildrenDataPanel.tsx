import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  ListItemText,
  Typography
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import Icon from 'src/shared/components/icon'
import Translations from 'src/app/layouts/components/Translations'
import { UserChildrenType } from 'src/entities/school/UserSchoolType'
import { forwardRef, SyntheticEvent, useEffect, useMemo } from 'react'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import CustomTextField from 'src/shared/components/mui/text-field'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import DatePicker from 'react-datepicker'
import { ErrorKeyType, LiteModelType } from 'src/entities/app/GeneralTypes'
import i18n from 'i18next'
import format from 'date-fns/format'
import { fetchUsers } from 'src/features/store/apps/user'
import { UserCreateType, UserListType } from 'src/entities/school/UserType'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import debounce from 'lodash/debounce'
import CustomAvatar from 'src/shared/components/mui/avatar'
import { errorTextHandler } from 'src/features/utils/api/errorHandler'

type SchoolClassroomType = {
  [key: string]: LiteModelType[]
}

type SchoolUserType = {
  [key: string]: UserListType[]
}

type PropsType = {
  errors: ErrorKeyType
  imgSrc: string
  formData: UserCreateType
  userChildren: UserChildrenType[]
  childrenOptions: SchoolUserType
  handleUpdateChildrenOptions: (key: string, val: UserListType[], del: boolean) => void
  classroomOptions: SchoolClassroomType
  handleDeleteChildren: (index: number) => void
  handleAddChildren: (obj: UserChildrenType) => void
  handleSelectChild: (index: number, child: string | UserListType | null) => void
  handleUpdateChild: (index: number, obj: any) => void
  handleUpdateUserChildren: (obj: UserChildrenType) => void
  handleGetSchoolClassrooms: (school: LiteModelType | null) => void
}

const getRandomId = () => Math.floor(Math.random() * 10000)

type PickerProps = {
  error?: boolean
  helperText?: string
}

const CustomInput = forwardRef(({ ...props }: PickerProps, ref) => {
  return <CustomTextField fullWidth {...props} inputRef={ref} label={i18n.t('Birthday')} autoComplete='off' />
})

const defaultChildObj = {
  first_name: '',
  last_name: '',
  middle_name: '',
  status: 'active',
  birthday: null,
  gender: null
}

const ChildrenDataPanel = (props: PropsType) => {
  // ** State
  const errors = props.errors
  const imgSrc = props.imgSrc
  const formData = props.formData
  const userChildren = props.userChildren
  const childrenOptions = props.childrenOptions
  const handleUpdateChildrenOptions = props.handleUpdateChildrenOptions
  const classroomOptions = props.classroomOptions
  const handleDeleteChildren = props.handleDeleteChildren
  const handleAddChildren = props.handleAddChildren
  const handleSelectChild = props.handleSelectChild
  const handleUpdateChild = props.handleUpdateChild
  const handleUpdateUserChildren = props.handleUpdateUserChildren
  const handleGetSchoolClassrooms = props.handleGetSchoolClassrooms

  // ** Hooks
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { users_list } = useSelector((state: RootState) => state.user)

  const handleFetchChildren = (schoolKey: string, newInputValue: string) => {
    dispatch(
      fetchUsers({
        limit: 100,
        offset: 0,
        role: 'student',
        school_id: schoolKey,
        search: newInputValue
      })
    )
      .unwrap()
      .then(res => {
        handleUpdateChildrenOptions(schoolKey, res.users, false)
      })
      .catch(err => {
        console.log(err)
      })
  }

  const debouncedFetch = useMemo(
    () =>
      debounce((schoolKey: string, newInputValue: string) => {
        handleFetchChildren(schoolKey, newInputValue)
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
            title={t('Children')}
            action={
              <Button
                fullWidth
                color='primary'
                variant='tonal'
                sx={{ minWidth: 190 }}
                startIcon={<Icon icon='tabler:plus' />}
                onClick={() => {
                  const childObj = {
                    index: getRandomId(),
                    child: defaultChildObj,
                    selected_child: null,
                    child_options: [],
                    classroom: null,
                    school: null
                  }
                  handleAddChildren(childObj)
                }}
              >
                <Translations text='AddChild' />
              </Button>
            }
          />
        </Card>
      </Grid>
      {userChildren.map((userChild, index) => (
        <Grid key={index} item xs={12} sm={12}>
          <Card>
            <CardHeader
              title={t('Child') + ` ${index + 1}`}
              action={
                <Button
                  variant='tonal'
                  color='error'
                  size='medium'
                  onClick={() => {
                    handleDeleteChildren(userChild.index)
                    if (userChild.school) {
                      handleUpdateChildrenOptions(userChild.school.key, [], true)
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
                    value={userChild?.school}
                    options={schools_lite_list.data}
                    loading={schools_lite_list.loading}
                    loadingText={t('ApiLoading')}
                    onChange={(e, v) => {
                      const childObj = { ...userChild, school: v }
                      handleUpdateUserChildren(childObj)
                      handleGetSchoolClassrooms(v)
                      if (v) {
                        handleUpdateChildrenOptions(v.key, [], false)
                      } else if (userChild.school) {
                        handleUpdateChildrenOptions(userChild.school.key, [], true)
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
                        {...(errors && errors[`children.${index}.schools.0.school_id`]
                          ? { error: true, helperText: errorTextHandler(errors[`children.${index}.schools.0.school_id`]) }
                          : null)}
                        label={t('School')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <CustomAutocomplete
                    id='classroom'
                    value={userChild?.classroom}
                    options={
                      userChild?.school && classroomOptions[userChild?.school?.key]
                        ? classroomOptions[userChild?.school.key]
                        : []
                    }
                    loading={classrooms_lite_list.loading}
                    isOptionEqualToValue={(option, value) => option.key === value.key}
                    loadingText={t('ApiLoading')}
                    onChange={(e, v) => {
                      const childObj = { ...userChild, classroom: v }
                      handleUpdateUserChildren(childObj)
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
                        {...(errors && errors[`children.${index}.classrooms.0.classroom_id`]
                          ? { error: true, helperText: errorTextHandler(errors[`children.${index}.classrooms.0.classroom_id`]) }
                          : null)}
                        label={t('Classroom')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <DatePicker
                    locale='tm'
                    autoComplete='off'
                    selected={userChild.child?.birthday ? new Date(userChild.child?.birthday) : null}
                    dateFormat='dd.MM.yyyy'
                    showYearDropdown
                    showMonthDropdown
                    preventOpenOnFocus
                    placeholderText='DD.MM.YYYY'
                    customInput={
                      <CustomInput
                        {...(errors && errors[`children.${index}.birthday`]
                          ? { error: true, helperText: errorTextHandler(errors[`children.${index}.birthday`]) }
                          : null)}
                      />
                    }
                    id='birthday'
                    calendarStartDay={1}
                    onChange={(date: Date | null) => {
                      const childObj = {
                        ...userChild.child,
                        birthday: date ? format(new Date(date), 'yyyy-MM-dd') : ''
                      }
                      handleUpdateChild(userChild.index, childObj)
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <CustomAutocomplete
                    id='surname'
                    freeSolo
                    autoComplete
                    value={userChild?.selected_child}
                    options={userChild?.school?.key ? childrenOptions[userChild.school.key] : []}
                    filterOptions={x => x}
                    loading={users_list.loading}
                    loadingText={t('ApiLoading')}
                    onInputChange={(event, newInputValue) => {
                      if (newInputValue && userChild?.school?.key) {
                        debouncedFetch(userChild.school.key, newInputValue)
                      }

                      const childObj = {
                        ...userChild?.child,
                        last_name: newInputValue
                      }
                      handleUpdateChild(userChild.index, childObj)
                    }}
                    onChange={(event: SyntheticEvent, newValue: string | UserListType | null) => {
                      if (typeof newValue !== 'string') {
                        const childObj = {
                          id: newValue?.id || null,
                          first_name: newValue?.first_name || null,
                          last_name: newValue?.last_name || null,
                          middle_name: newValue?.middle_name || null,
                          birthday: newValue?.birthday ? format(new Date(newValue?.birthday), 'yyyy-MM-dd') : '',
                          status: newValue?.status || null
                        }
                        handleUpdateChild(userChild.index, childObj)
                        handleSelectChild(userChild.index, newValue)
                        if (newValue?.classroom_id && newValue?.classroom_name) {
                          const classroomObj = { key: newValue?.classroom_id, value: newValue?.classroom_name }
                          const childSchoolObj = { ...userChild, classroom: classroomObj }
                          handleUpdateUserChildren(childSchoolObj)
                        }
                      } else {
                        const childObj = {
                          ...userChild?.child,
                          id: null,
                          last_name: newValue
                        }
                        handleUpdateChild(userChild.index, childObj)
                        handleSelectChild(userChild.index, newValue)
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
                        {...(errors && errors[`children.${index}.last_name`]
                          ? { error: true, helperText: errorTextHandler(errors[`children.${index}.last_name`]) }
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
                    value={userChild.child?.first_name || ''}
                    onChange={e => {
                      const childObj = {
                        ...userChild.child,
                        first_name: e.target.value
                      }
                      handleUpdateChild(userChild.index, childObj)
                    }}
                    {...(errors && errors[`children.${index}.first_name`]
                      ? { error: true, helperText: errorTextHandler(errors[`children.${index}.first_name`]) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <CustomTextField
                    fullWidth
                    label={t('FatherName')}
                    placeholder=''
                    value={userChild.child?.middle_name || ''}
                    onChange={e => {
                      const childObj = {
                        ...userChild.child,
                        middle_name: e.target.value
                      }
                      handleUpdateChild(userChild.index, childObj)
                    }}
                    {...(errors && errors[`children.${index}.middle_name`]
                      ? { error: true, helperText: errorTextHandler(errors[`children.${index}.middle_name`]) }
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

export default ChildrenDataPanel
