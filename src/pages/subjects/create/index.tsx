// ** React Imports
import { FormEvent, SyntheticEvent, useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Component Import
import CustomTextField from 'src/shared/components/mui/text-field'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'

// ** Type Imports
import { SubjectCreateType, SubjectSettingsType } from 'src/entities/classroom/SubjectType'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

// ** Store Imports
import { fetchUsersLite } from 'src/features/store/apps/user'
import { addSubject } from 'src/features/store/apps/subjects'
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import { fetchClassrooms } from 'src/features/store/apps/classrooms'

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { ClassroomListType, SubGroupType } from 'src/entities/classroom/ClassroomType'
import { CircularProgress, ListItemText, MenuItem, SelectChangeEvent } from '@mui/material'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { renderSubgroup } from 'src/features/utils/ui/renderSubgroup'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import Error from 'src/widgets/general/Error'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import { fetchSettings } from 'src/features/store/apps/settings'
import useKeyboardSubmit from 'src/features/hooks/useKeyboardSubmit'

const defaultValues: SubjectCreateType = {
  name: '',
  full_name: '',
  week_hours: null,
  classroom_type: null,
  classroom_type_key: null,
  classroom_id: null,
  teacher_id: null,
  second_teacher_id: null,
  school_id: null
}

const SubjectCreate = () => {
  // ** State
  const [formData, setFormData] = useState<SubjectCreateType>(defaultValues)
  const [subjectName, setSubjectName] = useState<SubjectSettingsType | null>(null)
  const [classroom, setClassroom] = useState<ClassroomListType | null>(null)
  const [school, setSchool] = useState<LiteModelType | null>(null)
  const [teacher, setTeacher] = useState<LiteModelType | null>(null)
  const [secondTeacher, setSecondTeacher] = useState<LiteModelType | null>(null)
  const [subGroups, setSubGroups] = useState<SubGroupType[] | null>(null)
  const [selectedSubGroup, setSelectedSubGroup] = useState<string>('full')
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { subject_add } = useSelector((state: RootState) => state.subjects)
  const { settings } = useSelector((state: RootState) => state.settings)
  const { classrooms_list } = useSelector((state: RootState) => state.classrooms)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)

  useEffect(() => {
    dispatch(
      fetchSchoolsLite({
        limit: 750,
        offset: 0,
        is_select: true
      })
    )
    dispatch(
      fetchClassrooms({
        limit: 500,
        offset: 0
      })
    )
    dispatch(
      fetchUsersLite({
        limit: 5000,
        offset: 0,
        role: 'teacher'
      })
    )
    dispatch(fetchSettings({}))
  }, [dispatch])

  useEffect(() => {
    if (classroom && classroom.sub_groups) {
      setSubGroups(
        classroom.sub_groups.map((sub_group: SubGroupType) => {
          return { ...sub_group, id: sub_group.type + sub_group.type_key.toString() }
        })
      )
    }
  }, [classroom])

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: SubjectCreateType, is_list: boolean | string) => {
    event?.preventDefault()

    dispatch(addSubject(data))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        if (is_list === 'new') {
          router.replace(router.asPath)
          setFormData(defaultValues)
          setSubjectName(null)
          setClassroom(null)
          setSchool(null)
          setTeacher(null)
          setSecondTeacher(null)
          setSubGroups(null)
          setSelectedSubGroup('')
        } else {
          router.push(is_list === true ? '/subjects' : `/subjects/view/${res.subject.id}`)
        }
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

  const handleFormChange = (field: keyof SubjectCreateType, value: SubjectCreateType[keyof SubjectCreateType]) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const val = event.target.value as string
    setSelectedSubGroup(val)
    if (val === 'full') {
      setFormData({
        ...formData,
        classroom_type: null,
        classroom_type_key: null
      })
    } else {
      setFormData({
        ...formData,
        classroom_type: val.slice(0, -1),
        classroom_type_key: parseInt(val.slice(-1) as string)
      })
    }
  }

  const handleSubmit = () => {
    onSubmit(null, formData, 'new')
  }

  const handleSubmitAndList = () => {
    onSubmit(null, formData, false)
  }

  useKeyboardSubmit(handleSubmit, handleSubmitAndList)

  if (settings.error) {
    return <Error error={settings.error} />
  }

  return (
    <form
      autoComplete='off'
      onSubmit={e => {
        onSubmit(e, formData, false)
      }}
    >
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('SubjectInformation')} />
            <Divider />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
                  <CustomAutocomplete
                    id='name'
                    value={subjectName}
                    options={settings.data.subject ? settings.data.subject.subjects : []}
                    loadingText={t('ApiLoading')}
                    loading={settings.loading}
                    onChange={(event: SyntheticEvent, newValue: SubjectSettingsType | null) => {
                      setSubjectName(newValue)
                      if (newValue) {
                        setFormData({ ...formData, name: newValue.name, full_name: newValue.full_name })
                      }
                    }}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => (
                      <li {...props} key={item.full_name}>
                        <ListItemText>{item.full_name}</ListItemText>
                      </li>
                    )}
                    getOptionLabel={option => option.full_name || ''}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        {...(errors && errors['name']
                          ? { error: true, helperText: errorTextHandler(errors['name']) }
                          : null)}
                        inputProps={{ ...params.inputProps, tabIndex: 1 }}
                        required
                        label={t('Name')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomAutocomplete
                    id='classroom_id'
                    value={classroom}
                    options={classrooms_list.data}
                    loading={classrooms_list.loading}
                    loadingText={t('ApiLoading')}
                    onChange={(event: SyntheticEvent, newValue: ClassroomListType | null) => {
                      setClassroom(newValue)
                      handleFormChange('classroom_id', newValue?.id)
                    }}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => (
                      <li {...props} key={item.id}>
                        <ListItemText>{item.name}</ListItemText>
                      </li>
                    )}
                    getOptionLabel={option => option.name || ''}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        {...(errors && errors['classroom_id']
                          ? { error: true, helperText: errorTextHandler(errors['classroom_id']) }
                          : null)}
                        inputProps={{ ...params.inputProps, tabIndex: 2 }}
                        label={t('Classroom')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    type='number'
                    InputProps={{ inputProps: { tabIndex: 3 } }}
                    onWheel={event => event.target instanceof HTMLElement && event.target.blur()}
                    label={t('LessonHours')}
                    value={formData.week_hours}
                    onChange={e =>
                      handleFormChange('week_hours', e.target.value !== '' ? parseInt(e.target.value) : null)
                    }
                    {...(errors && errors['week_hours']
                      ? { error: true, helperText: errorTextHandler(errors['week_hours']) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomAutocomplete
                    id='school_id'
                    value={school}
                    options={schools_lite_list.data}
                    loading={schools_lite_list.loading}
                    loadingText={t('ApiLoading')}
                    onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                      setSchool(newValue)
                      handleFormChange('school_id', newValue?.key)
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
                        {...(errors && errors['school_id']
                          ? { error: true, helperText: errorTextHandler(errors['school_id']) }
                          : null)}
                        inputProps={{ ...params.inputProps, tabIndex: 4 }}
                        label={t('School')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomAutocomplete
                    id='teacher_id'
                    value={teacher}
                    options={users_lite_list.data}
                    loading={users_lite_list.loading}
                    loadingText={t('ApiLoading')}
                    onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                      setTeacher(newValue)
                      handleFormChange('teacher_id', newValue?.key)
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
                        {...(errors && errors['teacher_id']
                          ? { error: true, helperText: errorTextHandler(errors['teacher_id']) }
                          : null)}
                        inputProps={{ ...params.inputProps, tabIndex: 5 }}
                        label={t('Teacher')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomAutocomplete
                    id='second_teacher_id'
                    value={secondTeacher}
                    options={users_lite_list.data}
                    loading={users_lite_list.loading}
                    loadingText={t('ApiLoading')}
                    onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                      setSecondTeacher(newValue)
                      handleFormChange('second_teacher_id', newValue?.key)
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
                        {...(errors && errors['second_teacher_id']
                          ? { error: true, helperText: errorTextHandler(errors['second_teacher_id']) }
                          : null)}
                        inputProps={{ ...params.inputProps, tabIndex: 6 }}
                        label={t('SecondTeacher')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    select
                    fullWidth
                    defaultValue={selectedSubGroup}
                    InputProps={{ inputProps: { tabIndex: 7 } }}
                    placeholder={t('FullClassroom') as string}
                    label={t('Subgroup')}
                    SelectProps={{ value: selectedSubGroup, onChange: e => handleChange(e) }}
                    {...(errors && errors['classroom_type']
                      ? { error: true, helperText: errorTextHandler(errors['classroom_type']) }
                      : null)}
                  >
                    <MenuItem selected value='full'>
                      <Translations text='FullClassroom' />
                    </MenuItem>
                    {subGroups !== null &&
                      subGroups.map((sub_group, index) => (
                        <MenuItem key={index} value={sub_group.id as string}>
                          {renderSubgroup(sub_group.type) + ' - ' + sub_group.type_key}
                        </MenuItem>
                      ))}
                  </CustomTextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
          <Button variant='contained' sx={{ mr: 4 }} disabled={subject_add.loading} type='submit'>
            {subject_add.loading ? (
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
            variant='contained'
            sx={{ mr: 4 }}
            disabled={subject_add.loading}
            onClick={() => {
              onSubmit(null, formData, true)
            }}
          >
            {subject_add.loading ? (
              <CircularProgress
                sx={{
                  width: '20px !important',
                  height: '20px !important',
                  mr: theme => theme.spacing(2)
                }}
              />
            ) : null}
            <Translations text='SubmitAndList' />
          </Button>
          <Button variant='tonal' color='secondary' onClick={() => router.back()}>
            <Translations text='GoBack' />
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

SubjectCreate.acl = {
  action: 'write',
  subject: 'admin_subjects'
}

export default SubjectCreate
