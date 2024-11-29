// ** React Imports
import { useState, useEffect, SyntheticEvent, FormEvent, forwardRef } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Component Import
import CustomTextField from 'src/shared/components/mui/text-field'
import { convertTeacherExcuseData } from 'src/features/utils/api/convertTeacherExcuseData'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'

// ** Types
import { fetchUsersLite } from 'src/features/store/apps/user'
import { AppDispatch, RootState } from 'src/features/store'
import { TeacherExcuseCreateType, TeacherExcuseType } from 'src/entities/school/TeacherExcuseType'
import { getCurrentTeacherExcuse, updateTeacherExcuse } from 'src/features/store/apps/teacherExcuses'
import { Box, CircularProgress, IconButton, ListItemText, Typography, styled } from '@mui/material'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { DateType, ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import Error from 'src/widgets/general/Error'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import Icon from 'src/shared/components/icon'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import format from 'date-fns/format'

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    height: 40
  }
}))

const defaultValues: TeacherExcuseCreateType = {
  start_date: null,
  end_date: null,
  reason: null,
  note: null,
  teacher_id: null
}

interface PickerProps {
  label?: string
  readOnly?: boolean
}

const CustomInput = forwardRef(({ ...props }: PickerProps, ref) => {
  return <CustomTextField fullWidth {...props} label={props.label || ''} inputRef={ref} autoComplete='off' />
})

const TeacherExcuseEdit = () => {
  // ** State
  const [startDate, setStartDate] = useState<DateType>(null)
  const [endDate, setEndDate] = useState<DateType>(null)
  const [teacher, setTeacher] = useState<LiteModelType | null>(null)
  const [oldFiles, setOldFiles] = useState<string[]>([])
  const [filesToSend, setFilesToSend] = useState<any[]>([])
  const [formData, setFormData] = useState<TeacherExcuseCreateType>(defaultValues)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const currentTeacherExcuseId = router.query.teacherExcuseId
  const dispatch = useDispatch<AppDispatch>()
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { teacher_excuse_detail, teacher_excuse_update } = useSelector((state: RootState) => state.teacherExcuses)

  useEffect(() => {
    dispatch(
      fetchUsersLite({
        limit: 500,
        offset: 0,
        role: 'teacher'
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (currentTeacherExcuseId !== undefined) {
      dispatch(getCurrentTeacherExcuse(currentTeacherExcuseId as string))
    }
  }, [dispatch, currentTeacherExcuseId])

  useEffect(() => {
    if (
      currentTeacherExcuseId !== undefined &&
      !teacher_excuse_detail.loading &&
      teacher_excuse_detail.status === 'success' &&
      teacher_excuse_detail.data &&
      teacher_excuse_detail.data.id === (currentTeacherExcuseId as string) &&
      !users_lite_list.loading &&
      users_lite_list.status === 'success' &&
      users_lite_list.data
    ) {
      const detailData: TeacherExcuseType = { ...(teacher_excuse_detail.data as TeacherExcuseType) }
      setTeacher(users_lite_list.data.find((teacher: LiteModelType) => teacher.key === detailData.teacher?.id) || null)
      if (detailData.start_date) {
        setStartDate(new Date(detailData.start_date))
      }
      if (detailData.end_date) {
        setEndDate(new Date(detailData.end_date))
      }
      if (detailData.document_files) {
        setOldFiles(detailData.document_files)
      }
      setFormData(convertTeacherExcuseData(detailData))
    }
  }, [currentTeacherExcuseId, teacher_excuse_detail, users_lite_list])

  const handleDownloadFile = (file: string) => {
    const link = document.createElement('a')
    link.href = file
    link.download = ''
    link.target = '_blank'
    link.click()
  }

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

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: TeacherExcuseCreateType, is_list: boolean) => {
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

    dispatch(updateTeacherExcuse({ data: formDataToSend, id: currentTeacherExcuseId as string }))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
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

  if (teacher_excuse_detail.error) {
    return <Error error={teacher_excuse_detail.error} />
  }

  if (!teacher_excuse_detail.loading && currentTeacherExcuseId) {
    return (
      <>
        <form
          autoComplete='off'
          onSubmit={e => {
            onSubmit(e, formData, false)
          }}
          encType='multipart/form-data'
        >
          <DatePickerWrapper>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader title={t('TeacherExcuseInformation')} />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={5}>
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
                          disabled
                          fullWidth
                          defaultValue=''
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
                          disabled
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
                          disabled
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
                      {oldFiles && oldFiles.length !== 0 && (
                        <Grid item xs={12} sm={12}>
                          <Card>
                            <CardContent sx={{ p: 3, pb: '0.75rem!important' }}>
                              {oldFiles.map((file, index) => (
                                <Button
                                  key={index}
                                  variant='tonal'
                                  color='success'
                                  sx={{ mr: 4, mb: 2 }}
                                  onClick={() => {
                                    handleDownloadFile(file)
                                  }}
                                  startIcon={<Icon icon='tabler:download' fontSize={20} />}
                                >
                                  {index + 1} <Translations text='DownloadFile' />
                                </Button>
                              ))}
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
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
                <Button variant='contained' sx={{ mr: 4 }} disabled={teacher_excuse_update.loading} type='submit'>
                  {teacher_excuse_update.loading ? (
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
                  disabled={teacher_excuse_update.loading}
                  onClick={() => {
                    onSubmit(null, formData, true)
                  }}
                >
                  {teacher_excuse_update.loading ? (
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

TeacherExcuseEdit.acl = {
  action: 'write',
  subject: 'admin_teacher_excuses'
}

export default TeacherExcuseEdit
