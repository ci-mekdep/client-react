// ** React Imports
import { FormEvent, SyntheticEvent, forwardRef, useEffect, useState } from 'react'

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
import { SubjectExamCreateType, SubjectType } from 'src/entities/classroom/SubjectType'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

// ** Store Imports
import { fetchUsersLite } from 'src/features/store/apps/user'

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { CircularProgress, ListItemText } from '@mui/material'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { DateType, ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import { addSubjectExam } from 'src/features/store/apps/subjectExams'
import CustomChip from 'src/shared/components/mui/chip'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'

interface PickerProps {
  label?: string
}

const defaultValues: SubjectExamCreateType = {
  id: '',
  subject_id: null,
  teacher_id: null,
  head_teacher_id: null,
  member_teacher_ids: [],
  start_time: null,
  time_length_min: null,
  room_number: null,
  is_required: null,
  exam_weight_percent: null
}

const CustomInput = forwardRef(({ ...props }: PickerProps, ref) => {
  return <CustomTextField InputProps={{ inputProps: { tabIndex: 4 } }} fullWidth inputRef={ref} {...props} />
})

const SubjectExamCreate = () => {
  // ** State
  const [formData, setFormData] = useState<SubjectExamCreateType>(defaultValues)
  const [teacher, setTeacher] = useState<LiteModelType | null>(null)
  const [headTeacher, setHeadTeacher] = useState<LiteModelType | null>(null)
  const [memberTeachers, setMemberTeachers] = useState<LiteModelType[]>([])
  const [dateTime, setDateTime] = useState<DateType | null>(null)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const id = router.query.subjectId
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { subject_exam_add } = useSelector((state: RootState) => state.subjectExams)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { subject_detail } = useSelector((state: RootState) => state.subjects)
  const currentSubject: SubjectType = { ...(subject_detail.data as SubjectType) }

  useEffect(() => {
    dispatch(
      fetchUsersLite({
        limit: 5000,
        offset: 0,
        roles: ['teacher', 'principal']
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (id !== undefined) handleFormChange('subject_id', id as string)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: SubjectExamCreateType) => {
    event?.preventDefault()

    dispatch(addSubjectExam(data))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        router.push(`/subjects/view/${id}`)
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
    field: keyof SubjectExamCreateType,
    value: SubjectExamCreateType[keyof SubjectExamCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <DatePickerWrapper>
      <form
        autoComplete='off'
        onSubmit={e => {
          onSubmit(e, formData)
        }}
      >
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={
                  subject_detail.status !== 'success'
                    ? t('SubjectExamInformation')
                    : t('SubjectExamInformation') + ': ' + currentSubject.name + ' - ' + currentSubject.classroom?.name
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid item xs={12} sm={6}>
                    <CustomAutocomplete
                      id='teacher_id'
                      value={teacher}
                      options={users_lite_list.data}
                      loading={users_lite_list.loading}
                      loadingText={t('ApiLoading')}
                      onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                        setTeacher(newValue)
                        if (newValue) {
                          handleFormChange('teacher_id', newValue.key)
                        } else {
                          handleFormChange('teacher_id', null)
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
                          {...(errors && errors['teacher_id']
                            ? { error: true, helperText: errorTextHandler(errors['teacher_id']) }
                            : null)}
                          inputProps={{ ...params.inputProps, tabIndex: 1 }}
                          required
                          label={t('ExamTeacher')}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomAutocomplete
                      id='head_teacher_id'
                      value={headTeacher}
                      options={users_lite_list.data}
                      loading={users_lite_list.loading}
                      loadingText={t('ApiLoading')}
                      onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                        setHeadTeacher(newValue)
                        if (newValue) {
                          handleFormChange('head_teacher_id', newValue.key)
                        } else {
                          handleFormChange('head_teacher_id', null)
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
                          {...(errors && errors['head_teacher_id']
                            ? { error: true, helperText: errorTextHandler(errors['head_teacher_id']) }
                            : null)}
                          inputProps={{ ...params.inputProps, tabIndex: 2 }}
                          label={t('ExamHeadTeacher')}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomAutocomplete
                      id='member_teacher_ids'
                      size='small'
                      multiple
                      fullWidth
                      value={memberTeachers}
                      options={users_lite_list.data}
                      loading={users_lite_list.loading}
                      loadingText={t('ApiLoading')}
                      onChange={(e: any, v: LiteModelType[]) => {
                        setMemberTeachers(v)
                        handleFormChange(
                          'member_teacher_ids',
                          v.map(item => item.key)
                        )
                      }}
                      disableCloseOnSelect={true}
                      isOptionEqualToValue={(option, value) => option.key === value.key}
                      getOptionLabel={option => option.value}
                      noOptionsText={t('NoRows')}
                      renderOption={(props, item) => (
                        <li {...props} key={item.key}>
                          <ListItemText>{item.value}</ListItemText>
                        </li>
                      )}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          {...(errors && errors['member_teacher_ids']
                            ? { error: true, helperText: errorTextHandler(errors['member_teacher_ids']) }
                            : null)}
                          inputProps={{ ...params.inputProps, tabIndex: 3 }}
                          label={t('ExamMembers')}
                        />
                      )}
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
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      locale='tm'
                      id='start_time'
                      autoComplete='off'
                      showTimeSelect
                      showYearDropdown
                      showMonthDropdown
                      timeFormat='HH:mm'
                      timeIntervals={15}
                      selected={dateTime}
                      calendarStartDay={1}
                      preventOpenOnFocus
                      dateFormat='dd.MM.yyyy HH:mm'
                      onChange={(date: Date | null) => {
                        setDateTime(date)
                        handleFormChange('start_time', date ? date.toISOString() : null)
                      }}
                      customInput={
                        <CustomInput
                          label={t('StartTime') as string}
                          {...(errors && errors['start_time']
                            ? { error: true, helperText: errorTextHandler(errors['start_time']) }
                            : null)}
                        />
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField
                      id='time_length_min'
                      fullWidth
                      type='number'
                      inputProps={{
                        min: 0,
                        step: 5
                      }}
                      InputProps={{ inputProps: { tabIndex: 5 } }}
                      onWheel={event => event.target instanceof HTMLElement && event.target.blur()}
                      label={t('Duration') + ` (${t('Minute')})`}
                      value={formData.time_length_min}
                      onChange={e => handleFormChange('time_length_min', parseInt(e.target.value))}
                      {...(errors && errors['time_length_min']
                        ? { error: true, helperText: errorTextHandler(errors['time_length_min']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField
                      id='room_number'
                      fullWidth
                      type='text'
                      label={t('CabinetNumber')}
                      InputProps={{ inputProps: { tabIndex: 6 } }}
                      value={formData.room_number}
                      onChange={e => handleFormChange('room_number', e.target.value)}
                      {...(errors && errors['room_number']
                        ? { error: true, helperText: errorTextHandler(errors['room_number']) }
                        : null)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
            <Button variant='contained' sx={{ mr: 4 }} disabled={subject_exam_add.loading} type='submit'>
              {subject_exam_add.loading ? (
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
            <Button variant='tonal' color='secondary' onClick={() => router.back()}>
              <Translations text='GoBack' />
            </Button>
          </Grid>
        </Grid>
      </form>
    </DatePickerWrapper>
  )
}

SubjectExamCreate.acl = {
  action: 'write',
  subject: 'admin_subjects_exams'
}

export default SubjectExamCreate
