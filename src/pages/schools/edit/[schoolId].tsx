// ** React Imports
import { useState, useEffect, SyntheticEvent, FormEvent, ChangeEvent, ElementType } from 'react'

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
import CustomTextField from 'src/shared/components/mui/text-field'
import { convertSchoolData } from 'src/features/utils/api/convertSchoolData'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'

// ** Types
import { fetchUsersLite } from 'src/features/store/apps/user'
import { AppDispatch, RootState } from 'src/features/store'
import { SchoolCreateType, SchoolType } from 'src/entities/school/SchoolType'
import { getCurrentSchool, updateSchool } from 'src/features/store/apps/school'
import {
  Box,
  ButtonGroup,
  Checkbox,
  CircularProgress,
  Collapse,
  IconButton,
  ListItemText,
  Typography,
  styled
} from '@mui/material'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { fetchRegions } from 'src/features/store/apps/regions'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import Error from 'src/widgets/general/Error'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import Icon from 'src/shared/components/icon'
import dynamic from 'next/dynamic'
import CustomAvatar from 'src/shared/components/mui/avatar'

const Map = dynamic(() => import('src/widgets/general/map/ClickableMap'), { ssr: false })

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

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    height: 40
  }
}))

const PreviewImg = styled('img')(() => ({}))

const defaultValues: SchoolCreateType = {
  id: '',
  code: '',
  name: '',
  full_name: '',
  phone: '',
  email: '',
  address: '',
  level: null,
  parent_id: null,
  is_secondary_school: null,
  is_digitalized: false
}

const SchoolEdit = () => {
  // ** State
  const [collapsedImages, setCollapsedImages] = useState<boolean>(false)
  const [collapsedMap, setCollapsedMap] = useState<boolean>(false)
  const [formData, setFormData] = useState<SchoolCreateType>(defaultValues)
  const [isSecondarySchool, setIsSecondarySchool] = useState<boolean>(true)
  const [admin, setAdmin] = useState<LiteModelType | null>(null)
  const [specialist, setSpecialist] = useState<LiteModelType | null>(null)
  const [position, setPosition] = useState<number[] | null>(null)
  const [filesToSend, setFilesToSend] = useState<any[]>([])
  const [oldImages, setOldImages] = useState<string[]>([])
  const [galleriesDelete, setGalleriesDelete] = useState<string[]>([])

  const [avatar, setAvatar] = useState<File | null>()
  const [avatarSrc, setAvatarSrc] = useState<string>('')
  const [avatarInputValue, setAvatarInputValue] = useState<string>('')
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const currentSchoolId = router.query.schoolId
  const dispatch = useDispatch<AppDispatch>()
  const { region_list } = useSelector((state: RootState) => state.regions)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { school_detail, school_update } = useSelector((state: RootState) => state.schools)

  useEffect(() => {
    dispatch(fetchRegions())
  }, [dispatch])

  useEffect(() => {
    if (currentSchoolId !== undefined) {
      dispatch(getCurrentSchool(currentSchoolId as string))
      dispatch(
        fetchUsersLite({
          limit: 5000,
          offset: 0,
          role: 'principal',
          school_id: currentSchoolId as string
        })
      )
    }
  }, [dispatch, currentSchoolId])

  useEffect(() => {
    if (position) {
      handleFormChange('latitude', position[0].toString())
      handleFormChange('longitude', position[1].toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position])

  useEffect(() => {
    if (
      currentSchoolId !== undefined &&
      !school_detail.loading &&
      school_detail.status === 'success' &&
      school_detail.data &&
      school_detail.data.id === (currentSchoolId as string) &&
      !users_lite_list.loading &&
      users_lite_list.status === 'success' &&
      users_lite_list.data
    ) {
      const detailData: SchoolType = { ...(school_detail.data as SchoolType) }
      setAdmin(users_lite_list.data.find((teacher: LiteModelType) => teacher.key === detailData.admin?.id) || null)
      setAvatarSrc(school_detail.data?.avatar)
      setSpecialist(
        users_lite_list.data.find((teacher: LiteModelType) => teacher.key === detailData.specialist?.id) || null
      )
      setIsSecondarySchool(detailData.is_secondary_school)
      if (detailData.latitude !== null && detailData.longitude !== null) {
        setPosition([Number(detailData.latitude), Number(detailData.longitude)])
      } else {
        setPosition([37.94, 58.38])
      }
      if (detailData.galleries) {
        setOldImages(detailData.galleries)
      }
      setFormData(convertSchoolData(detailData))
    }
  }, [currentSchoolId, school_detail, users_lite_list])

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

  const handleFormChange = (field: keyof SchoolCreateType, value: SchoolCreateType[keyof SchoolCreateType]) => {
    setFormData({ ...formData, [field]: value })
  }

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: SchoolCreateType, is_list: boolean) => {
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
    if (admin) {
      formDataToSend.append('admin_id', admin.key.toString())
    }
    if (specialist) {
      formDataToSend.append('specialist_id', specialist.key.toString())
    }
    if (position) {
      formDataToSend.append('latitude', position[0].toString())
      formDataToSend.append('longitude', position[1].toString())
    }
    galleriesDelete.map(file => {
      formDataToSend.append('galleries_delete', file)
    })

    filesToSend.map(fileToSend => {
      formDataToSend.append('galleries', fileToSend)
    })

    if (avatar === null) {
      formDataToSend.append('avatar_delete', 'true')
    } else if (avatar !== undefined) {
      formDataToSend.append('avatar', avatar as File)
    }

    dispatch(updateSchool({ data: formDataToSend, id: currentSchoolId as string }))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        router.push(is_list === true ? '/schools' : `/schools/view/${res.school.id}`)
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

  if (school_detail.error) {
    return <Error error={school_detail.error} />
  }

  if (!school_detail.loading && currentSchoolId) {
    return (
      <>
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
                        tabIndex={3}
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
                        tabIndex={4}
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
                  <Grid container spacing={5}>
                    <Grid item xs={12} sm={6}>
                      <CustomTextField
                        fullWidth
                        label={t('Code')}
                        InputProps={{ inputProps: { tabIndex: 5 } }}
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
                        InputProps={{ inputProps: { tabIndex: 6 } }}
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
                        InputProps={{ inputProps: { tabIndex: 7 } }}
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
                        InputProps={{ inputProps: { tabIndex: 8 } }}
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
                        InputProps={{ inputProps: { tabIndex: 9 } }}
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
                          inputProps: { tabIndex: 10 },
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
                        InputProps={{ inputProps: { tabIndex: 11 } }}
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
                        defaultValue=''
                        label={t('Type')}
                        InputProps={{ inputProps: { tabIndex: 12 } }}
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
                      <CustomAutocomplete
                        id='admin_id'
                        value={admin}
                        options={users_lite_list.data}
                        loading={users_lite_list.loading}
                        loadingText={t('ApiLoading')}
                        onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                          setAdmin(newValue)
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
                            inputProps={{ ...params.inputProps, tabIndex: 13 }}
                            label={t('RoleMainPrincipal')}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomAutocomplete
                        id='specialist_id'
                        value={specialist}
                        options={users_lite_list.data}
                        loading={users_lite_list.loading}
                        loadingText={t('ApiLoading')}
                        onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                          setSpecialist(newValue)
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
                            inputProps={{ ...params.inputProps, tabIndex: 14 }}
                            label={t('Specialist')}
                          />
                        )}
                      />
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
                          tabIndex={15}
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
                  title={`${t('Images')} (${oldImages.length})`}
                  action={
                    <Button
                      color='primary'
                      variant='tonal'
                      sx={{ px: 10, minWidth: 130 }}
                      onClick={() => {
                        setCollapsedImages(!collapsedImages)
                      }}
                      endIcon={
                        <Icon icon={!collapsedImages ? 'tabler:chevron-down' : 'tabler:chevron-up'} fontSize={20} />
                      }
                    >
                      {collapsedImages ? <Translations text='Close' /> : <Translations text='Open' />}
                    </Button>
                  }
                />
                <Divider />
                <Collapse in={collapsedImages}>
                  <CardContent>
                    <Grid container spacing={6}>
                      {oldImages && (
                        <Grid item xs={12} sm={12}>
                          <Grid container spacing={5}>
                            {oldImages.map((image, index) => (
                              <Grid item xs={12} sm={12} md={6} lg={4} key={index}>
                                <Box
                                  position={'relative'}
                                  display={'flex'}
                                  justifyContent={'center'}
                                  width={'100%'}
                                  height={300}
                                  mb={3}
                                >
                                  <Box position='relative' width={'100%'} height={'100%'}>
                                    <PreviewImg
                                      src={image}
                                      alt='file-preview'
                                      sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                    <Checkbox
                                      size='small'
                                      name='delete'
                                      sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        zIndex: 999,
                                        '& svg': {
                                          backgroundColor: '#fff',
                                          borderRadius: '5px'
                                        }
                                      }}
                                      checked={galleriesDelete.includes(image)}
                                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                        if (event.target.checked === true) {
                                          setGalleriesDelete(prev => [...prev, image])
                                        } else {
                                          setGalleriesDelete(prev => prev.filter(val => val !== image))
                                        }
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
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
                              tabIndex={16}
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
                      endIcon={
                        <Icon icon={!collapsedMap ? 'tabler:chevron-down' : 'tabler:chevron-up'} fontSize={20} />
                      }
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
                        {position && (
                          <Box style={{ height: 536 }}>
                            <Map position={position} setPosition={setPosition} />
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
              <Button variant='contained' sx={{ mr: 4 }} disabled={school_update.loading} type='submit'>
                {school_update.loading ? (
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
                disabled={school_update.loading}
                onClick={() => {
                  onSubmit(null, formData, true)
                }}
              >
                {school_update.loading ? (
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

SchoolEdit.acl = {
  action: 'write',
  subject: 'admin_schools'
}

export default SchoolEdit
