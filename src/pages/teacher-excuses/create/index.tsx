import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
  Typography,
  styled
} from '@mui/material'
import { FormEvent, forwardRef, SyntheticEvent, useEffect, useState } from 'react'
import Translations from 'src/app/layouts/components/Translations'
import Icon from 'src/shared/components/icon'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import CustomTextField from 'src/shared/components/mui/text-field'
import { useTranslation } from 'react-i18next'
import { TeacherExcuseCreateType } from 'src/entities/school/TeacherExcuseType'
import { DateType, ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { addTeacherExcuse } from 'src/features/store/apps/teacherExcuses'
import toast from 'react-hot-toast'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import format from 'date-fns/format'
import { useRouter } from 'next/router'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { fetchUsersLite } from 'src/features/store/apps/user'

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    height: 40
  }
}))

interface PickerProps {
  label?: string
  readOnly?: boolean
}

const CustomInput = forwardRef(({ ...props }: PickerProps, ref) => {
  return <CustomTextField fullWidth {...props} label={props.label || ''} inputRef={ref} autoComplete='off' />
})

const defaultValues: TeacherExcuseCreateType = {
  start_date: null,
  end_date: null,
  reason: null,
  note: null,
  teacher_id: null
}

const TeacherExcuseCreate = () => {
  const [startDate, setStartDate] = useState<DateType>(null)
  const [endDate, setEndDate] = useState<DateType>(null)
  const [teacher, setTeacher] = useState<LiteModelType | null>(null)
  const [filesToSend, setFilesToSend] = useState<any[]>([])
  const [formData, setFormData] = useState<TeacherExcuseCreateType>(defaultValues)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { teacher_excuse_add } = useSelector((state: RootState) => state.teacherExcuses)
  const { users_lite_list } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    dispatch(fetchUsersLite({ limit: 500, offset: 0, role: 'teacher' }))
  }, [dispatch])

  const handleDeleteFile = (file: File) => {
    const newFiles = filesToSend.filter(f => f.name !== file.name)
    setFilesToSend(newFiles)
  }

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files !== null && Array.from(e.target.files)
    setFilesToSend([...filesToSend, ...(selectedFiles as File[])])
  }

  const handleFormChange = (
    field: keyof TeacherExcuseCreateType,
    value: TeacherExcuseCreateType[keyof TeacherExcuseCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  const onSubmit = (
    event: FormEvent<HTMLFormElement> | null,
    formData: TeacherExcuseCreateType,
    is_list: boolean | string
  ) => {
    event?.preventDefault()

    const formDataToSend = new FormData()
    for (const [key, value] of Object.entries(formData)) {
      if (value !== '' && value !== null) {
        formDataToSend.append(key, value as any)
      }
    }
    filesToSend.map(fileToSend => {
      formDataToSend.append('files', fileToSend)
    })

    dispatch(addTeacherExcuse({ data: formDataToSend }))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        setStartDate(null)
        setEndDate(null)
        setFormData(defaultValues)
        setFilesToSend([])
        router.push(is_list === true ? '/teacher-excuses' : `/teacher-excuses/view/${res.teacher_excuse.id}`)
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
    <form
      encType='multipart/form-data'
      autoComplete='off'
      onSubmit={e => {
        onSubmit(e, formData, false)
      }}
    >
      <DatePickerWrapper>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title={t('TeacherExcuseInformation')} />
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
                      select
                      fullWidth
                      label={t('Reason')}
                      SelectProps={{
                        value: formData.reason,
                        onChange: e => handleFormChange('reason', e.target.value as string)
                      }}
                      {...(errors && errors['reason']
                        ? { error: true, helperText: errorTextHandler(errors['reason']) }
                        : null)}
                    >
                      <MenuItem value='excuse_vacation'>
                        <Translations text='TeacherExcuseVacation' />
                      </MenuItem>
                      <MenuItem value='excuse_unpaid'>
                        <Translations text='TeacherExcuseUnpaid' />
                      </MenuItem>
                      <MenuItem value='excuse_paid'>
                        <Translations text='TeacherExcusePaid' />
                      </MenuItem>
                      <MenuItem value='excuse_business_trip'>
                        <Translations text='TeacherExcuseBusiness' />
                      </MenuItem>
                      <MenuItem value='excuse_study_trip'>
                        <Translations text='TeacherExcuseStudy' />
                      </MenuItem>
                      <MenuItem value='excuse_maternity'>
                        <Translations text='TeacherExcuseMaternity' />
                      </MenuItem>
                      <MenuItem value='excuse_ill'>
                        <Translations text='TeacherExcuseIll' />
                      </MenuItem>
                    </CustomTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      locale='tm'
                      autoComplete='off'
                      selected={startDate}
                      dateFormat='dd.MM.yyyy'
                      showYearDropdown
                      showMonthDropdown
                      preventOpenOnFocus
                      placeholderText='DD.MM.YYYY'
                      customInput={
                        <CustomInput
                          label={t('ExcuseStartDate') as string}
                          {...(errors && errors['start_date']
                            ? { error: true, helperText: errorTextHandler(errors['start_date']) }
                            : null)}
                        />
                      }
                      id='start_date'
                      calendarStartDay={1}
                      onChange={(date: Date | null) => {
                        setStartDate(date)
                        handleFormChange('start_date', date ? format(date, 'yyyy-MM-dd') : '')
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      locale='tm'
                      autoComplete='off'
                      selected={endDate}
                      dateFormat='dd.MM.yyyy'
                      showYearDropdown
                      showMonthDropdown
                      preventOpenOnFocus
                      placeholderText='DD.MM.YYYY'
                      customInput={
                        <CustomInput
                          label={t('ExcuseEndDate') as string}
                          {...(errors && errors['end_date']
                            ? { error: true, helperText: errorTextHandler(errors['end_date']) }
                            : null)}
                        />
                      }
                      id='end_date'
                      calendarStartDay={1}
                      onChange={(date: Date | null) => {
                        setEndDate(date)
                        handleFormChange('end_date', date ? format(date, 'yyyy-MM-dd') : '')
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <CustomTextField
                      fullWidth
                      label={t('Note')}
                      value={formData.note}
                      onChange={e => handleFormChange('note', e.target.value)}
                      {...(errors && errors['note']
                        ? { error: true, helperText: errorTextHandler(errors['note']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Card>
                      <CardContent>
                        {filesToSend.map((fileToSend, index) => (
                          <Card key={index} sx={{ marginBottom: 4 }}>
                            <Box
                              display={'flex'}
                              flexDirection={'row'}
                              alignItems={'center'}
                              justifyContent={'space-between'}
                              gap={4}
                              padding={3}
                            >
                              <Box display={'flex'} alignItems={'center'} gap={4}>
                                <Img
                                  height={30}
                                  alt='device-logo'
                                  src={`/images/extensions/${fileToSend.name.split('.').pop()}.png`}
                                  onError={(e: any) => (e.target.src = '/images/extensions/default.png')}
                                />
                                <Typography variant='h6' fontWeight={600}>
                                  {fileToSend.name}
                                </Typography>
                              </Box>
                              <Box minWidth={20}>
                                <IconButton
                                  size='small'
                                  onClick={() => {
                                    handleDeleteFile(fileToSend)
                                  }}
                                  sx={{ color: 'text.secondary' }}
                                >
                                  <Icon icon='tabler:trash' fontSize={22} />
                                </IconButton>
                              </Box>
                            </Box>
                          </Card>
                        ))}
                        <Button
                          color='primary'
                          component='label'
                          variant='contained'
                          htmlFor='upload-image'
                          sx={{ mr: 4 }}
                          startIcon={<Icon icon='tabler:upload' fontSize={20} />}
                        >
                          <Translations text='SelectFile' />
                          <input hidden id='upload-image' type='file' multiple onChange={handleInputFileChange} />
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
            <Button variant='contained' sx={{ mr: 4 }} disabled={teacher_excuse_add.loading} type='submit'>
              {teacher_excuse_add.loading ? (
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
              disabled={teacher_excuse_add.loading}
              onClick={() => {
                onSubmit(null, formData, true)
              }}
            >
              {teacher_excuse_add.loading ? (
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
      </DatePickerWrapper>
    </form>
  )
}

TeacherExcuseCreate.acl = {
  action: 'write',
  subject: 'admin_teacher_excuses'
}

export default TeacherExcuseCreate
