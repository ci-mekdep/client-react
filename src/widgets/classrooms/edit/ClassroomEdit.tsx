// ** React Imports
import { useState, useEffect, SyntheticEvent, FormEvent } from 'react'

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

// ** Utils Imports
import { convertClassroomData } from 'src/features/utils/api/convertClassroomData'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'

// ** Types
import { fetchUsersLite } from 'src/features/store/apps/user'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import { ClassroomCreateType } from 'src/entities/classroom/ClassroomType'
import { getCurrentClassroom, updateClassroom } from 'src/features/store/apps/classrooms'
import { Box, CircularProgress, ListItemText, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import Translations from 'src/app/layouts/components/Translations'
import { PeriodType } from 'src/entities/school/PeriodType'
import { fetchPeriods } from 'src/features/store/apps/periods'

const defaultValues: ClassroomCreateType = {
  name: '',
  teacher_id: null,
  student_id: null,
  school_id: null
}

const ClassroomEdit = () => {
  // ** State
  const [formData, setFormData] = useState<ClassroomCreateType>(defaultValues)
  const [teacher, setTeacher] = useState<LiteModelType | null>(null)
  const [student, setStudent] = useState<LiteModelType | null>(null)
  const [period, setPeriod] = useState<PeriodType | null>(null)
  const [school, setSchool] = useState<LiteModelType | null>(null)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  const [teachers, setTeachers] = useState<LiteModelType[]>([])
  const [students, setStudents] = useState<LiteModelType[]>([])

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const currentClassroomId = router.query.classroomId
  const dispatch = useDispatch<AppDispatch>()
  const { classroom_detail, classroom_update } = useSelector((state: RootState) => state.classrooms)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { periods_list } = useSelector((state: RootState) => state.periods)

  useEffect(() => {
    if (currentClassroomId !== undefined) {
      dispatch(
        fetchUsersLite({
          limit: 5000,
          offset: 0,
          role: 'student',
          classroom_id: currentClassroomId as string
        })
      )
        .then(res => {
          setStudents(res.payload.users)
        })
        .catch(err => {
          toast.error(errorHandler(err), { duration: 2000 })
        })
    }
  }, [dispatch, currentClassroomId])

  const fetchTeachers = async () => {
    dispatch(fetchUsersLite({ limit: 5000, offset: 0, role: 'teacher' }))
      .then(res => {
        setTeachers(res.payload.users)
      })
      .catch(err => {
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  useEffect(() => {
    fetchTeachers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    dispatch(
      fetchPeriods({
        limit: 500,
        offset: 0
      })
    )
    dispatch(
      fetchSchoolsLite({
        limit: 750,
        offset: 0,
        is_select: true
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (currentClassroomId !== undefined) {
      dispatch(getCurrentClassroom(currentClassroomId as string))
    }
  }, [dispatch, currentClassroomId])

  useEffect(() => {
    if (
      currentClassroomId !== undefined &&
      !classroom_detail.loading &&
      classroom_detail.status === 'success' &&
      teachers &&
      students &&
      schools_lite_list.data &&
      periods_list.data
    ) {
      setFormData(convertClassroomData(classroom_detail.data))
      setSchool(
        schools_lite_list.data.find((school: LiteModelType) => school.key === classroom_detail.data?.school?.id) || null
      )
      setTeacher(teachers.find((teacher: LiteModelType) => teacher.key === classroom_detail.data?.teacher?.id) || null)
      setPeriod(periods_list.data.find((period: PeriodType) => period.id === classroom_detail.data?.period?.id) || null)
      setStudent(students.find((student: LiteModelType) => student.key === classroom_detail.data?.student?.id) || null)
    }
  }, [dispatch, currentClassroomId, teachers, students, schools_lite_list.data, periods_list.data, classroom_detail])

  const handleFormChange = (
    field: keyof ClassroomCreateType,
    value: ClassroomCreateType[keyof ClassroomCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: ClassroomCreateType, is_list: boolean) => {
    event?.preventDefault()

    dispatch(updateClassroom(data))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        router.push(is_list === true ? '/classrooms' : `/classrooms/view/${res.classroom.id}`)
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

  if (classroom_detail.error) {
    return <Error error={classroom_detail.error} />
  }

  if (!classroom_detail.loading && currentClassroomId) {
    return (
      <>
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
                        options={teachers}
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
                            inputProps={{ ...params.inputProps, tabIndex: 4 }}
                            label={t('HeadTeacher')}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomAutocomplete
                        id='student_id'
                        value={student}
                        options={students}
                        loading={users_lite_list.loading}
                        loadingText={t('ApiLoading')}
                        onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                          setStudent(newValue)
                          handleFormChange('student_id', newValue?.key)
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
                            {...(errors && errors['student_id']
                              ? { error: true, helperText: errorTextHandler(errors['student_id']) }
                              : null)}
                            inputProps={{ ...params.inputProps, tabIndex: 5 }}
                            label={t('HeadStudent')}
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
                            inputProps={{ ...params.inputProps, tabIndex: 6 }}
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
                            inputProps={{ ...params.inputProps, tabIndex: 7 }}
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
              <Button variant='contained' sx={{ mr: 4 }} disabled={classroom_update.loading} type='submit'>
                {classroom_update.loading ? (
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
                disabled={classroom_update.loading}
                onClick={() => {
                  onSubmit(null, formData, true)
                }}
              >
                {classroom_update.loading ? (
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
      </>
    )
  } else {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }
}

export default ClassroomEdit
