// ** React Imports
import { ChangeEvent, ElementType, FormEvent, useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button, { ButtonProps } from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'

// ** Custom Component Import
import CustomAvatar from 'src/shared/components/mui/avatar'
import CustomTextField from 'src/shared/components/mui/text-field'

// ** Type Imports
import { SchoolCreateType, SchoolType } from 'src/entities/school/SchoolType'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

// ** Store Imports
import { addSchool } from 'src/features/store/apps/school'
import { fetchRegions } from 'src/features/store/apps/regions'

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { Box, ButtonGroup, Checkbox, CircularProgress, Collapse, IconButton, Typography, styled } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import Translations from 'src/app/layouts/components/Translations'
import dynamic from 'next/dynamic'
import Icon from 'src/shared/components/icon'
import useKeyboardSubmit from 'src/features/hooks/useKeyboardSubmit'
import { ErrorKeyType, ErrorModelType } from 'src/entities/app/GeneralTypes'

const Map = dynamic(() => import('src/widgets/general/map/ClickableMap'), { ssr: false })

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    height: 40
  }
}))

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(2)
  }
}))

const defaultValues: SchoolCreateType = {
  code: '',
  name: '',
  full_name: '',
  phone: '',
  email: '',
  address: '',
  level: null,
  parent_id: null,
  is_secondary_school: true,
  is_digitalized: false
}

const SchoolCreate = () => {
  // ** State
  const [collapsedImages, setCollapsedImages] = useState<boolean>(false)
  const [collapsedMap, setCollapsedMap] = useState<boolean>(false)
  const [position, setPosition] = useState<number[] | null>(null)
  const [isSecondarySchool, setIsSecondarySchool] = useState<boolean>(true)
  const [formData, setFormData] = useState<SchoolCreateType>(defaultValues)
  const [filesToSend, setFilesToSend] = useState<any[]>([])

  const [avatar, setAvatar] = useState<File | null>()
  const [avatarSrc, setAvatarSrc] = useState<string>('')
  const [avatarInputValue, setAvatarInputValue] = useState<string>('')
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { region_list } = useSelector((state: RootState) => state.regions)
  const { school_add } = useSelector((state: RootState) => state.schools)

  useEffect(() => {
    dispatch(fetchRegions())
  }, [dispatch])

  useEffect(() => {
    if (position) {
      handleFormChange('latitude', position[0].toString())
      handleFormChange('longitude', position[1].toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position])

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: SchoolCreateType, is_list: boolean | string) => {
    event?.preventDefault()

    const formDataToSend = new FormData()
    if (data) {
      formDataToSend.append('code', data.code)
      formDataToSend.append('name', data.name)
      formDataToSend.append('full_name', data.full_name)
      formDataToSend.append('phone', data.phone)
      formDataToSend.append('is_secondary_school', data.is_secondary_school === false ? '0' : '1')
      formDataToSend.append('is_digitalized', data.is_digitalized === true ? '1' : '0')
    }
    if (data.parent_id) {
      formDataToSend.append('parent_id', data.parent_id.toString())
    }
    if (data.level) {
      formDataToSend.append('level', data.level)
    }
    if (data.address) {
      formDataToSend.append('address', data.address)
    }
    if (data.email) {
      formDataToSend.append('email', data.email)
    }
    if (position) {
      formDataToSend.append('latitude', position[0].toString())
      formDataToSend.append('longitude', position[1].toString())
    }
    filesToSend.map(fileToSend => {
      formDataToSend.append('galleries', fileToSend)
    })
    if (avatar === null) {
      formDataToSend.append('avatar_delete', 'true')
    } else if (avatar !== undefined) {
      formDataToSend.append('avatar', avatar as File)
    }

    dispatch(addSchool(formDataToSend))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        if (is_list === 'new') {
          router.replace(router.asPath)
          setFormData(defaultValues)
          setFilesToSend([])
          setPosition(null)
          setIsSecondarySchool(true)
        } else {
          router.push(is_list === true ? '/schools' : `/schools/view/${res.school.id}`)
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

  const handleFormChange = (field: keyof SchoolCreateType, value: SchoolCreateType[keyof SchoolCreateType]) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleDeleteFile = (file: File) => {
    const newFiles = filesToSend.filter(f => f.name !== file.name)
    setFilesToSend(newFiles)
  }

  const handleInputImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files !== null && Array.from(e.target.files)
    setFilesToSend([...filesToSend, ...(selectedFiles as File[])])
  }
  const handleAvatarInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files as FileList
    setAvatar(selectedFiles?.[0] as File)

    const reader = new FileReader()
    const { files } = event.target as HTMLInputElement
    if (files && files.length !== 0) {
      reader.onload = () => {
        setAvatarSrc(reader.result as string)
      }
      reader.readAsDataURL(files[0])

      if (reader.result !== null) {
        setAvatarInputValue(reader.result as string)
      }
    }
  }

  const handleInputImageReset = () => {
    setAvatarInputValue('')
    setAvatarSrc('')
    setAvatar(null)
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
      encType='multipart/form-data'
    >
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CustomAvatar
                  src={avatarSrc}
                  sx={{
                    width: 100,
                    height: 100,
                    marginRight: theme => theme.spacing(6),
                    borderRadius: theme => theme.shape.borderRadius + 'px!important'
                  }}
                  alt={formData.name}
                />
                <div>
                  <ButtonStyled
                    tabIndex={1}
                    component='label'
                    variant='tonal'
                    htmlFor='upload-avatar'
                    startIcon={<Icon icon='tabler:photo' />}
                  >
                    <Translations text='UploadAvatar' />
                    <input
                      hidden
                      type='file'
                      value={avatarInputValue}
                      accept='image/png, image/jpeg'
                      onChange={handleAvatarInputChange}
                      id='upload-avatar'
                    />
                  </ButtonStyled>
                  <ResetButtonStyled
                    tabIndex={2}
                    variant='tonal'
                    color='error'
                    onClick={handleInputImageReset}
                    startIcon={<Icon icon='tabler:trash' />}
                  >
                    <Translations text='DeleteAvatar' />
                  </ResetButtonStyled>
                </div>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('SchoolInformation')}
              action={
                <ButtonGroup variant='outlined' fullWidth>
                  <Button
                    tabIndex={1}
                    data-ignore='true'
                    onClick={() => {
                      setIsSecondarySchool(true)
                      handleFormChange('is_secondary_school', true)
                    }}
                    sx={{ width: 200 }}
                    variant={isSecondarySchool === true ? 'contained' : 'outlined'}
                  >
                    <Translations text='School' />
                  </Button>
                  <Button
                    tabIndex={2}
                    data-ignore='true'
                    onClick={() => {
                      setIsSecondarySchool(false)
                      handleFormChange('is_secondary_school', false)
                    }}
                    sx={{ width: 200 }}
                    variant={isSecondarySchool === false ? 'contained' : 'outlined'}
                  >
                    <Translations text='EduCenter' />
                  </Button>
                </ButtonGroup>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label={t('Code')}
                    InputProps={{ inputProps: { tabIndex: 3 } }}
                    value={formData.code}
                    onChange={e => handleFormChange('code', e.target.value)}
                    {...(errors && errors['code']
                      ? {
                          error: true,
                          helperText:
                            errors['code'] === 'unique' ? (
                              <Box display='flex' gap={1}>
                                <Typography variant='body2' color='error.main'>
                                  {errorTextHandler(errors['code'])}
                                </Typography>
                                <Typography
                                  variant='body2'
                                  color='error.main'
                                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                                  onClick={() => {
                                    const currentParams = new URLSearchParams(window.location.search)

                                    currentParams.set('page', '0')
                                    currentParams.set('search', formData.code || '')

                                    const newUrl = `/schools?${currentParams.toString()}`
                                    window.open(newUrl, '_blank')
                                  }}
                                >
                                  <Translations text='ShowDuplicates' />
                                </Typography>
                              </Box>
                            ) : (
                              errorTextHandler(errors['code'])
                            )
                        }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label={t('Name')}
                    InputProps={{ inputProps: { tabIndex: 4 } }}
                    value={formData.name}
                    onChange={e => handleFormChange('name', e.target.value)}
                    {...(errors && errors['name']
                      ? { error: true, helperText: errorTextHandler(errors['name']) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label={t('Fullname')}
                    InputProps={{ inputProps: { tabIndex: 5 } }}
                    value={formData.full_name}
                    onChange={e => handleFormChange('full_name', e.target.value)}
                    {...(errors && errors['full_name']
                      ? { error: true, helperText: errorTextHandler(errors['full_name']) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    select
                    fullWidth
                    label={t('BelongRegion')}
                    InputProps={{ inputProps: { tabIndex: 6 } }}
                    SelectProps={{
                      value: formData.parent_id,
                      onChange: e => handleFormChange('parent_id', e.target.value as string)
                    }}
                    {...(errors && errors['parent_id']
                      ? { error: true, helperText: errorTextHandler(errors['parent_id']) }
                      : null)}
                  >
                    {Object.values(region_list.data).map((regions: SchoolType[]) =>
                      regions.map(region => (
                        <MenuItem key={region.id} value={region.id}>
                          {region.name}
                        </MenuItem>
                      ))
                    )}
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label={t('Address')}
                    InputProps={{ inputProps: { tabIndex: 7 } }}
                    value={formData.address}
                    onChange={e => handleFormChange('address', e.target.value)}
                    {...(errors && errors['address']
                      ? { error: true, helperText: errorTextHandler(errors['address']) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    type='text'
                    label={t('Phone')}
                    value={formData.phone}
                    onChange={e => {
                      const input = e.target.value
                      if (!input || !isNaN((input as any) - parseFloat(input)))
                        handleFormChange('phone', e.target.value)
                    }}
                    inputProps={{ maxLength: 8 }}
                    InputProps={{
                      inputProps: { tabIndex: 8 },
                      startAdornment: <InputAdornment position='start'>+993</InputAdornment>
                    }}
                    {...(errors && errors['phone']
                      ? { error: true, helperText: errorTextHandler(errors['phone']) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    type='email'
                    label={t('Email')}
                    InputProps={{ inputProps: { tabIndex: 9 } }}
                    value={formData.email}
                    onChange={e => handleFormChange('email', e.target.value)}
                    {...(errors && errors['email']
                      ? { error: true, helperText: errorTextHandler(errors['email']) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    select
                    fullWidth
                    label={t('Type')}
                    InputProps={{ inputProps: { tabIndex: 10 } }}
                    SelectProps={{
                      value: formData.level,
                      onChange: e => handleFormChange('level', e.target.value as string)
                    }}
                    {...(errors && errors['level']
                      ? { error: true, helperText: errorTextHandler(errors['level']) }
                      : null)}
                  >
                    <MenuItem value='normal'>
                      <Translations text='SchoolLevelNormal' />
                    </MenuItem>
                    <MenuItem value='special'>
                      <Translations text='SchoolLevelSpecial' />
                    </MenuItem>
                    <MenuItem value='professional'>
                      <Translations text='SchoolLevelProfessional' />
                    </MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    onClick={() => {
                      handleFormChange(
                        'is_digitalized',
                        formData.is_digitalized === true ? false : formData.is_digitalized === false ? true : true
                      )
                    }}
                    sx={{
                      px: 4,
                      py: 2,
                      display: 'flex',
                      borderRadius: 1,
                      cursor: 'pointer',
                      position: 'relative',
                      alignItems: 'flex-start',
                      border: theme =>
                        `1px solid ${
                          formData.is_digitalized === true ? theme.palette.primary.main : theme.palette.divider
                        }`,
                      '&:hover': {
                        borderColor: theme =>
                          `rgba(${
                            formData.is_digitalized === true
                              ? theme.palette.primary.light
                              : theme.palette.customColors.main
                          }, 0.25)`
                      }
                    }}
                  >
                    <Checkbox
                      tabIndex={11}
                      size='small'
                      name='is_digitalized'
                      checked={formData.is_digitalized}
                      sx={{ mb: -2, mt: -2.5, ml: -2.75 }}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        handleFormChange('is_digitalized', event.target.checked === true)
                      }}
                    />
                    <Translations text='IsDigitalized' />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('Images')}
              action={
                <Button
                  color='primary'
                  variant='tonal'
                  sx={{ px: 10, minWidth: 130 }}
                  onClick={() => {
                    setCollapsedImages(!collapsedImages)
                  }}
                  endIcon={<Icon icon={!collapsedImages ? 'tabler:chevron-down' : 'tabler:chevron-up'} fontSize={20} />}
                >
                  {collapsedImages ? <Translations text='Close' /> : <Translations text='Open' />}
                </Button>
              }
            />
            <Divider />
            <Collapse in={collapsedImages}>
              <CardContent>
                <Grid container spacing={6}>
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
                          tabIndex={12}
                          color='primary'
                          component='label'
                          variant='contained'
                          htmlFor='upload-image'
                          sx={{ mr: 4 }}
                          startIcon={<Icon icon='tabler:upload' fontSize={20} />}
                        >
                          <Translations text='SelectFile' />
                          <input hidden id='upload-image' type='file' multiple onChange={handleInputImageChange} />
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('LocationAtMap')}
              action={
                <Button
                  color='primary'
                  variant='tonal'
                  sx={{ px: 10, minWidth: 130 }}
                  onClick={() => {
                    setCollapsedMap(!collapsedMap)
                  }}
                  endIcon={<Icon icon={!collapsedMap ? 'tabler:chevron-down' : 'tabler:chevron-up'} fontSize={20} />}
                >
                  {collapsedMap ? <Translations text='Close' /> : <Translations text='Open' />}
                </Button>
              }
            />
            <Divider />
            <Collapse in={collapsedMap}>
              <CardContent>
                <Grid container spacing={6}>
                  <Grid item xs={12} sm={12}>
                    <CustomTextField
                      fullWidth
                      label={t('LocationAtMap')}
                      InputProps={{ inputProps: { tabIndex: 14 } }}
                      value={position ? `${position[0]}, ${position[1]}` : ''}
                      onChange={e => {
                        const parts = e.target.value.split(',')
                        if (parts.length !== 2) return
                        const lat = parseFloat(parts[0])
                        const long = parseFloat(parts[1])
                        if (isNaN(lat) || isNaN(long)) return
                        setPosition([lat, long])
                      }}
                      sx={{ mb: 3 }}
                      {...(errors && errors['latitude']
                        ? { error: true, helperText: errorTextHandler(errors['latitude']) }
                        : null)}
                      {...(errors && errors['longitude']
                        ? { error: true, helperText: errorTextHandler(errors['longitude']) }
                        : null)}
                    />
                    <Box style={{ height: 536 }}>
                      <Map position={position} setPosition={setPosition} />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>
        <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
          <Button variant='contained' sx={{ mr: 4 }} disabled={school_add.loading} type='submit'>
            {school_add.loading ? (
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
            disabled={school_add.loading}
            onClick={() => {
              onSubmit(null, formData, true)
            }}
          >
            {school_add.loading ? (
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

SchoolCreate.acl = {
  action: 'write',
  subject: 'admin_schools'
}

export default SchoolCreate
