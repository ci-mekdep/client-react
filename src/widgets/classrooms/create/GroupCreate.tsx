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
import { ClassroomCreateType } from 'src/entities/classroom/ClassroomType'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Utils Imports

// ** Store Imports
import { fetchUsersLite } from 'src/features/store/apps/user'
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import { addClassroom } from 'src/features/store/apps/classrooms'

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { CircularProgress, ListItemText, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { useSelector } from 'react-redux'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import Translations from 'src/app/layouts/components/Translations'
import { BaseSubjectListType } from 'src/entities/classroom/BaseSubjectType'
import { fetchBaseSubjects } from 'src/features/store/apps/baseSubjects'
import { fetchShifts } from 'src/features/store/apps/shifts'
import { fetchPeriods } from 'src/features/store/apps/periods'
import { ShiftListType } from 'src/entities/classroom/ShiftType'
import { PeriodType } from 'src/entities/school/PeriodType'
import useKeyboardSubmit from 'src/features/hooks/useKeyboardSubmit'

const defaultSubject = {
  name: '',
  full_name: '',
  week_hours: null,
  teacher_id: null,
  exams: [],
  base_subject_id: null,
  period_id: null
}

const defaultValues: ClassroomCreateType = {
  name: '',
  teacher_id: null,
  school_id: null,
  shift_id: null,
  subjects: [defaultSubject]
}

const GroupCreate = () => {
  // ** State
  const [formData, setFormData] = useState<ClassroomCreateType>(defaultValues)
  const [teacher, setTeacher] = useState<LiteModelType | null>(null)
  const [school, setSchool] = useState<LiteModelType | null>(null)
  const [shift, setShift] = useState<ShiftListType | null>(null)
  const [period, setPeriod] = useState<PeriodType | null>(null)
  const [baseSubject, setBaseSubject] = useState<BaseSubjectListType | null>(null)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { classroom_add } = useSelector((state: RootState) => state.classrooms)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { base_subjects_list } = useSelector((state: RootState) => state.baseSubjects)
  const { shifts_list } = useSelector((state: RootState) => state.shifts)
  const { periods_list } = useSelector((state: RootState) => state.periods)

  useEffect(() => {
    dispatch(fetchUsersLite({ limit: 5000, offset: 0, role: 'teacher' }))
    dispatch(
      fetchSchoolsLite({
        limit: 750,
        offset: 0,
        is_select: true
      })
    )
    dispatch(
      fetchShifts({
        limit: 100,
        offset: 0
      })
    )
    dispatch(
      fetchPeriods({
        limit: 100,
        offset: 0
      })
    )
    dispatch(
      fetchBaseSubjects({
        limit: 200,
        offset: 0
      })
    )
  }, [dispatch])

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: ClassroomCreateType, is_list: boolean | string) => {
    event?.preventDefault()
    dispatch(addClassroom(data))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        if (is_list === 'new') {
          router.replace(router.asPath)
          setFormData(defaultValues)
          setTeacher(null)
          setSchool(null)
          setShift(null)
          setPeriod(null)
          setBaseSubject(null)
        } else {
          router.push(is_list === true ? '/classrooms' : `/classrooms/view/${res.classroom.id}`)
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

  const handleFormChange = (
    field: keyof ClassroomCreateType,
    value: ClassroomCreateType[keyof ClassroomCreateType]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onSubmit(null, formData, 'new')
  }

  const handleSubmitAndList = () => {
    onSubmit(null, formData, false)
  }

  useKeyboardSubmit(handleSubmit, handleSubmitAndList)

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
            <CardHeader title={t('GroupInformation')} />
            <Divider />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
                  <CustomAutocomplete
                    id='base_subject_id'
                    value={baseSubject}
                    options={base_subjects_list.data}
                    loading={base_subjects_list.loading}
                    loadingText={t('ApiLoading')}
                    onChange={(event: SyntheticEvent, newValue: BaseSubjectListType | null) => {
                      setBaseSubject(newValue)
                      const updatedSubjects = [
                        {
                          ...(formData.subjects ? formData.subjects[0] : defaultSubject),
                          name: newValue?.name || '',
                          base_subject_id: newValue?.id || null
                        }
                      ]
                      handleFormChange('subjects', updatedSubjects)
                      if (newValue !== null) {
                        handleFormChange('name', newValue?.name)
                      }
                    }}
                    getOptionLabel={option => option.name || ''}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => (
                      <li {...props} key={item.id}>
                        <ListItemText>{item.name}</ListItemText>
                      </li>
                    )}
                    renderInput={params => (
                      <CustomTextField
                        required
                        {...params}
                        {...(errors && errors['base_subject_id']
                          ? { error: true, helperText: errorTextHandler(errors['base_subject_id']) }
                          : null)}
                        inputProps={{ ...params.inputProps, tabIndex: 1 }}
                        label={t('Course')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label={t('GroupName')}
                    value={formData.name}
                    InputProps={{ inputProps: { tabIndex: 2 } }}
                    onChange={e => handleFormChange('name', e.target.value)}
                    {...(errors && errors['name']
                      ? { error: true, helperText: errorTextHandler(errors['name']) }
                      : null)}
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
                      const obj = [
                        {
                          ...(formData.subjects ? formData.subjects[0] : defaultSubject),
                          teacher_id: newValue?.key ? newValue.key : null
                        }
                      ]
                      handleFormChange('subjects', obj)
                      handleFormChange('teacher_id', newValue?.key)
                    }}
                    getOptionLabel={option => option.value || ''}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => (
                      <li {...props} key={item.key}>
                        <ListItemText>{item.value}</ListItemText>
                      </li>
                    )}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        required
                        inputProps={{ ...params.inputProps, tabIndex: 3 }}
                        label={t('Teacher')}
                        {...(errors && errors['teacher_id']
                          ? { error: true, helperText: errorTextHandler(errors['teacher_id']) }
                          : null)}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    type='text'
                    label={t('LessonHoursPerCourse')}
                    InputProps={{ inputProps: { tabIndex: 4 } }}
                    value={formData.subjects && formData.subjects[0].week_hours}
                    onChange={e => {
                      const input = e.target.value
                      if (!input || !isNaN((input as any) - parseFloat(input))) {
                        const obj = [
                          {
                            ...(formData.subjects ? formData.subjects[0] : defaultSubject),
                            week_hours: e.target.value === '' ? null : Number(e.target.value)
                          }
                        ]
                        handleFormChange('subjects', obj)
                      }
                    }}
                    {...(errors && errors['week_hours']
                      ? { error: true, helperText: errorTextHandler(errors['week_hours']) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    select
                    fullWidth
                    label={t('ClassroomLangType')}
                    InputProps={{ inputProps: { tabIndex: 5 } }}
                    SelectProps={{
                      value: formData.language,
                      onChange: e => handleFormChange('language', e.target.value as string)
                    }}
                    {...(errors && errors['language']
                      ? { error: true, helperText: errorTextHandler(errors['language']) }
                      : null)}
                  >
                    <MenuItem value='tm'>
                      <Translations text='LangTypeTm' />
                    </MenuItem>
                    <MenuItem value='ru'>
                      <Translations text='LangTypeRu' />
                    </MenuItem>
                    <MenuItem value='en'>
                      <Translations text='LangTypeEn' />
                    </MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomAutocomplete
                    id='shift_id'
                    value={shift}
                    options={shifts_list.data}
                    loading={shifts_list.loading}
                    loadingText={t('ApiLoading')}
                    onChange={(event: SyntheticEvent, newValue: ShiftListType | null) => {
                      setShift(newValue)
                      handleFormChange('shift_id', newValue?.id)
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
                        {...(errors && errors['shift']
                          ? { error: true, helperText: errorTextHandler(errors['shift']) }
                          : null)}
                        inputProps={{ ...params.inputProps, tabIndex: 6 }}
                        label={t('Shift')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomAutocomplete
                    id='period_id'
                    value={period}
                    options={periods_list.data}
                    loading={periods_list.loading}
                    loadingText={t('ApiLoading')}
                    onChange={(event: SyntheticEvent, newValue: PeriodType | null) => {
                      setPeriod(newValue)
                      handleFormChange('period_id', newValue?.id)
                    }}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => (
                      <li {...props} key={item.id}>
                        <ListItemText>{item.title}</ListItemText>
                      </li>
                    )}
                    getOptionLabel={option => option.title || ''}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        {...(errors && errors['period_id']
                          ? { error: true, helperText: errorTextHandler(errors['period_id']) }
                          : null)}
                        inputProps={{ ...params.inputProps, tabIndex: 7 }}
                        label={t('Season')}
                      />
                    )}
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
                        inputProps={{ ...params.inputProps, tabIndex: 8 }}
                        label={t('EduCenter')}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
          <Button variant='contained' sx={{ mr: 4 }} disabled={classroom_add.loading} type='submit'>
            {classroom_add.loading ? (
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
            disabled={classroom_add.loading}
            onClick={() => {
              onSubmit(null, formData, true)
            }}
          >
            {classroom_add.loading ? (
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

export default GroupCreate
