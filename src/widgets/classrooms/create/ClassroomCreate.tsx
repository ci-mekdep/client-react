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
import useKeyboardSubmit from 'src/features/hooks/useKeyboardSubmit'
import { PeriodType } from 'src/entities/school/PeriodType'
import { fetchPeriods } from 'src/features/store/apps/periods'

const defaultValues: ClassroomCreateType = {
  name: '',
  teacher_id: null,
  period_id: null,
  school_id: null
}

const ClassroomCreate = () => {
  // ** State
  const [formData, setFormData] = useState<ClassroomCreateType>(defaultValues)
  const [teacher, setTeacher] = useState<LiteModelType | null>(null)
  const [period, setPeriod] = useState<PeriodType | null>(null)
  const [school, setSchool] = useState<LiteModelType | null>(null)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { classroom_add } = useSelector((state: RootState) => state.classrooms)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { periods_list } = useSelector((state: RootState) => state.periods)

  useEffect(() => {
    dispatch(fetchUsersLite({ limit: 5000, offset: 0, role: 'teacher' }))
    dispatch(fetchPeriods({ limit: 500 }))
    dispatch(
      fetchSchoolsLite({
        limit: 750,
        offset: 0,
        is_select: true
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
          setPeriod(null)
          setSchool(null)
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
    setFormData({ ...formData, [field]: value })
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
            <CardHeader title={t('ClassroomInformation')} />
            <Divider />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label={t('Name')}
                    value={formData.name}
                    InputProps={{ inputProps: { tabIndex: 1 } }}
                    onChange={e => handleFormChange('name', e.target.value)}
                    {...(errors && errors['name']
                      ? { error: true, helperText: errorTextHandler(errors['name']) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    select
                    fullWidth
                    label={t('ClassroomLangType')}
                    InputProps={{ inputProps: { tabIndex: 2 } }}
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
                  <CustomTextField
                    select
                    fullWidth
                    label={t('Level')}
                    InputProps={{ inputProps: { tabIndex: 3 } }}
                    SelectProps={{
                      value: formData.level,
                      onChange: e => handleFormChange('level', e.target.value as string)
                    }}
                    {...(errors && errors['level']
                      ? { error: true, helperText: errorTextHandler(errors['level']) }
                      : null)}
                  >
                    <MenuItem value='low'>
                      <Translations text='ClassroomLevelLow' />
                    </MenuItem>
                    <MenuItem value='medium'>
                      <Translations text='ClassroomLevelMedium' />
                    </MenuItem>
                    <MenuItem value='high'>
                      <Translations text='ClassroomLevelHigh' />
                    </MenuItem>
                  </CustomTextField>
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
                        {...(errors && errors['teacher_id']
                          ? { error: true, helperText: errorTextHandler(errors['teacher_id']) }
                          : null)}
                        inputProps={{ ...params.inputProps, tabIndex: 4 }}
                        label={t('HeadTeacher')}
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
                    getOptionLabel={option => option.title || ''}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => (
                      <li {...props} key={item.id}>
                        <ListItemText>{item.title}</ListItemText>
                      </li>
                    )}
                    renderInput={params => (
                      <CustomTextField
                        required={true}
                        {...params}
                        {...(errors && errors['period_id']
                          ? { error: true, helperText: errorTextHandler(errors['period_id']) }
                          : null)}
                        inputProps={{ ...params.inputProps, tabIndex: 5 }}
                        label={t('Period')}
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
                        inputProps={{ ...params.inputProps, tabIndex: 6 }}
                        label={t('School')}
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

export default ClassroomCreate
