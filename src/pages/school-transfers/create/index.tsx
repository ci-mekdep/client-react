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

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { Box, CircularProgress, IconButton, ListItemText, Typography, styled } from '@mui/material'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { useSelector } from 'react-redux'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import useKeyboardSubmit from 'src/features/hooks/useKeyboardSubmit'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { SchoolTransferCreateType } from 'src/entities/app/SchoolTransferType'
import { addSchoolTransfer } from 'src/features/store/apps/schoolTransfers'
import { fetchClassroomsLite } from 'src/features/store/apps/classrooms'
import { fetchUsersLite } from 'src/features/store/apps/user'
import { fetchPublicRegionsV2 } from 'src/features/store/apps/publicRegions'
import { SchoolListType } from 'src/entities/school/SchoolType'
import { fetchPublicSchools } from 'src/features/store/apps/publicSchools'

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    height: 40
  }
}))

const defaultValues: SchoolTransferCreateType = {
  id: '',
  student_id: null,
  target_school_id: null,
  source_classroom_id: null,
  sender_note: null,
  sender_files: []
}

const SchoolTransferCreate = () => {
  // ** State
  const [formData, setFormData] = useState<SchoolTransferCreateType>(defaultValues)
  const [filesToSend, setFilesToSend] = useState<any[]>([])
  const [sourceClassroom, setSourceClassroom] = useState<LiteModelType | null>(null)
  const [student, setStudent] = useState<LiteModelType | null>(null)
  const [region, setRegion] = useState<SchoolListType | null>(null)
  const [targetSchool, setTargetSchool] = useState<SchoolListType | null>(null)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { public_regions_v2 } = useSelector((state: RootState) => state.publicRegions)
  const { public_schools_list } = useSelector((state: RootState) => state.publicSchools)
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { school_transfer_add } = useSelector((state: RootState) => state.schoolTransfers)

  useEffect(() => {
    dispatch(fetchPublicRegionsV2({}))
  }, [dispatch])

  useEffect(() => {
    if (region && region.id) {
      dispatch(fetchPublicSchools({ parent_id: region.id }))
    }
  }, [dispatch, region])

  useEffect(() => {
    dispatch(
      fetchClassroomsLite({
        limit: 200,
        offset: 0
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (sourceClassroom && sourceClassroom.key) {
      dispatch(
        fetchUsersLite({
          limit: 500,
          offset: 0,
          role: 'student',
          classroom_id: sourceClassroom.key
        })
      )
    }
  }, [dispatch, sourceClassroom])

  const handleDeleteFile = (file: File) => {
    const newFiles = filesToSend.filter(f => f.name !== file.name)
    setFilesToSend(newFiles)
  }

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files !== null && Array.from(e.target.files)
    setFilesToSend([...filesToSend, ...(selectedFiles as File[])])
  }

  const handleFormChange = (
    field: keyof SchoolTransferCreateType,
    value: SchoolTransferCreateType[keyof SchoolTransferCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  const onSubmit = (
    event: FormEvent<HTMLFormElement> | null,
    data: SchoolTransferCreateType,
    is_list: boolean | string
  ) => {
    event?.preventDefault()

    const formDataToSend = new FormData()
    if (data.student_id) {
      formDataToSend.append('student_id', data.student_id)
    }
    if (data.target_school_id) {
      formDataToSend.append('target_school_id', data.target_school_id)
    }
    if (data.source_classroom_id) {
      formDataToSend.append('source_classroom_id', data.source_classroom_id)
    }
    if (data.sender_note) {
      formDataToSend.append('sender_note', data.sender_note)
    }
    filesToSend.map(file => {
      formDataToSend.append('sender_files', file)
    })

    dispatch(addSchoolTransfer(formDataToSend))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        router.replace(is_list === true ? '/school-transfers' : `/school-transfers/view/${res.school_transfer.id}`)
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

  const handleSubmit = () => {
    onSubmit(null, formData, 'new')
  }

  const handleSubmitAndList = () => {
    onSubmit(null, formData, false)
  }

  useKeyboardSubmit(handleSubmit, handleSubmitAndList)

  return (
    <>
      <form
        encType='multipart/form-data'
        autoComplete='off'
        onSubmit={e => {
          onSubmit(e, formData, false)
        }}
      >
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title={t('SchoolTransferInformation')} />
              <Divider />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid item xs={12} sm={6}>
                    <CustomAutocomplete
                      id='source_classroom_id'
                      value={sourceClassroom}
                      options={classrooms_lite_list.data}
                      loading={classrooms_lite_list.loading}
                      loadingText={t('ApiLoading')}
                      onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                        setSourceClassroom(newValue)
                        handleFormChange('source_classroom_id', newValue?.key)
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
                          label={t('Classroom')}
                          {...(errors && errors['source_classroom_id']
                            ? { error: true, helperText: errorTextHandler(errors['source_classroom_id']) }
                            : null)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomAutocomplete
                      id='student_id'
                      value={student}
                      options={users_lite_list.data}
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
                          label={t('RoleStudent')}
                          {...(errors && errors['student_id']
                            ? { error: true, helperText: errorTextHandler(errors['student_id']) }
                            : null)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomAutocomplete
                      id='region_id'
                      value={region}
                      options={public_regions_v2.data}
                      loading={public_regions_v2.loading}
                      loadingText={t('ApiLoading')}
                      onChange={(event: SyntheticEvent, newValue: SchoolListType | null) => {
                        setRegion(newValue)
                      }}
                      noOptionsText={t('NoRows')}
                      renderOption={(props, item) => (
                        <li {...props} key={item.id}>
                          <ListItemText>{item.name}</ListItemText>
                        </li>
                      )}
                      getOptionLabel={option => option.name || ''}
                      renderInput={params => <CustomTextField {...params} label={t('Region')} />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomAutocomplete
                      id='target_school_id'
                      value={targetSchool}
                      options={public_schools_list.data}
                      loading={public_schools_list.loading}
                      loadingText={t('ApiLoading')}
                      onChange={(event: SyntheticEvent, newValue: SchoolListType | null) => {
                        setTargetSchool(newValue)
                        handleFormChange('target_school_id', newValue?.id)
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
                          label={t('TargetSchool')}
                          {...(errors && errors['target_school_id']
                            ? { error: true, helperText: errorTextHandler(errors['target_school_id']) }
                            : null)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <CustomTextField
                      fullWidth
                      label={t('SenderNote')}
                      value={formData.sender_note}
                      onChange={e => handleFormChange('sender_note', e.target.value)}
                      {...(errors && errors['sender_note']
                        ? { error: true, helperText: errorTextHandler(errors['sender_note']) }
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
            <Button variant='contained' sx={{ mr: 4 }} disabled={school_transfer_add.loading} type='submit'>
              {school_transfer_add.loading ? (
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
              disabled={school_transfer_add.loading}
              onClick={() => {
                onSubmit(null, formData, true)
              }}
            >
              {school_transfer_add.loading ? (
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
}

SchoolTransferCreate.acl = {
  action: 'write',
  subject: 'admin_school_transfers'
}

export default SchoolTransferCreate
