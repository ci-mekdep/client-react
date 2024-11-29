// ** React Imports
import { useEffect, useContext, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Import
import Icon from 'src/shared/components/icon'
import RoleCard from 'src/widgets/users/view/RoleCard'
import CustomChip from 'src/shared/components/mui/chip'
import CustomAvatar from 'src/shared/components/mui/avatar'
import Translations from 'src/app/layouts/components/Translations'

// ** Third party libraries
import format from 'date-fns/format'

// ** Types
import { UserType } from 'src/entities/school/UserType'

// ** Icon Imports
import { ThemeColor } from 'src/shared/layouts/types'

// ** Util Imports
import { renderRole } from 'src/features/utils/ui/renderRole'
import { getInitials } from 'src/shared/utils/get-initials'
import { renderPhone } from 'src/features/utils/ui/renderPhone'
import { renderGender } from 'src/features/utils/ui/renderGender'
import { renderUsername } from 'src/features/utils/ui/renderUsername'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { deleteUser, getCurrentUser, updatePremiumUser } from 'src/features/store/apps/user'
import { fetchSubjectsLite } from 'src/features/store/apps/subjects'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { UserRolesType, UserSchoolType } from 'src/entities/school/UserSchoolType'
import {
  ButtonGroup,
  CardActions,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  IconButtonProps,
  styled,
  Tooltip
} from '@mui/material'
import { useAuth } from 'src/features/hooks/useAuth'
import toast from 'react-hot-toast'
import { useDialog } from 'src/app/context/DialogContext'
import { ErrorKeyType, ErrorModelType } from 'src/entities/app/GeneralTypes'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'
import CustomUserAvatar from 'src/widgets/general/CustomUserAvatar'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { convertUserSchools } from 'src/features/utils/api/convertUserSchools'
import { SchoolTransferCreateType } from 'src/entities/app/SchoolTransferType'
import { addSchoolTransfer } from 'src/features/store/apps/schoolTransfers'
import SchoolTransferCreateDialog from 'src/widgets/school-transfers/SchoolTransferCreateDialog'

const CustomCloseButton = styled(IconButton)<IconButtonProps>(({ theme }) => ({
  top: 0,
  right: 0,
  color: 'grey.500',
  position: 'absolute',
  boxShadow: theme.shadows[2],
  transform: 'translate(10px, -10px)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette.background.paper} !important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'translate(7px, -5px)'
  }
}))

const showStatusChip = (val: string) => {
  if (val === 'active') {
    return <CustomChip skin='light' size='small' rounded label={i18n.t('StatusActive') as string} color='success' />
  } else if (val === 'blocked') {
    return <CustomChip skin='light' size='small' rounded label={i18n.t('StatusBlocked') as string} color='error' />
  } else if (val === 'wait') {
    return <CustomChip skin='light' size='small' rounded label={i18n.t('StatusWaiting') as string} color='warning' />
  }
}

const UserView = () => {
  const [isSchoolTransferOpen, setIsSchoolTransferOpen] = useState<boolean>(false)
  const [errors, setErrors] = useState<ErrorKeyType>({})
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [tabValue, setTabValue] = useState<string>('role')
  const [userSchools, setUserSchools] = useState<UserRolesType>({})

  const router = useRouter()
  const id = router.query.userId
  const { t } = useTranslation()
  const showDialog = useDialog()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { current_role, is_secondary_school } = useAuth()
  const { user_detail } = useSelector((state: RootState) => state.user)
  const data: UserType = { ...(user_detail.data as UserType) }
  const { subjects_lite_list } = useSelector((state: RootState) => state.subjects)

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentUser(id as string))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (id !== undefined && !user_detail.loading && user_detail.status === 'success') {
      setUserSchools(convertUserSchools(user_detail.data))
    }
  }, [id, user_detail])

  useEffect(() => {
    if (
      id !== undefined &&
      !user_detail.loading &&
      user_detail.status === 'success' &&
      user_detail.data.id === (id as string) &&
      user_detail.data?.schools?.some((school: UserSchoolType) => school.role_code === 'teacher')
    ) {
      dispatch(
        fetchSubjectsLite({
          limit: 50,
          offset: 0,
          teacher_ids: [id as string]
        })
      )
    }
  }, [data.id, data?.schools, user_detail, dispatch, id])

  useEffect(() => {
    handleChangeTab('role')
  }, [router])

  const handleChangeTab = (newValue: string) => {
    setTabValue(newValue)
  }

  const handleDownloadFile = (file: string) => {
    const link = document.createElement('a')
    link.href = file
    link.download = ''
    link.target = '_blank'
    link.click()
  }

  const handleShowDialog = async (user: UserType) => {
    const confirmed = await showDialog()
    if (confirmed) {
      handleDeleteUser(user)
    }
  }

  const handleDeleteUser = async (user: UserType) => {
    const deleteData: any = {}
    deleteData.school = user.school_id
    deleteData.user = user.id
    deleteData.role = user.role
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteUser([JSON.stringify(deleteData)]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        router.replace('/users')
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleCloseSchoolModal = () => {
    setIsSchoolTransferOpen(false)
  }

  const handleCreateSchoolTransfer = (data: SchoolTransferCreateType) => {
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
    data.sender_files.map(file => {
      formDataToSend.append('sender_files', file)
    })

    dispatch(addSchoolTransfer(formDataToSend))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        router.replace(`/school-transfers/view/${res.school_transfer.id}`)
        setIsSchoolTransferOpen(false)
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

  const onPromoteSubmit = (id: string) => {
    setIsOpen(false)
    handleUpdatePremium(id)
  }

  const handleUpdatePremium = async (id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(updatePremiumUser(id))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        dispatch(getCurrentUser(id))
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  if (subjects_lite_list.error) {
    return <Error error={subjects_lite_list.error} />
  }

  if (user_detail.error) {
    return <Error error={user_detail.error} />
  }

  if (!user_detail.loading && id && data.id === (id as string)) {
    return (
      <>
        <Dialog
          fullWidth
          open={isOpen}
          onClose={handleClose}
          sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 512 }, '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
          <DialogContent
            sx={{
              pb: theme => `${theme.spacing(6)} !important`,
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <CustomCloseButton onClick={handleClose}>
              <Icon icon='tabler:x' fontSize='1.25rem' />
            </CustomCloseButton>
            <Box
              sx={{
                display: 'flex',
                textAlign: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
                '& svg': { mb: 6, color: 'primary.main' }
              }}
            >
              <Icon icon='tabler:exclamation-circle' fontSize='5rem' />
              <Typography variant='h3' mb={4}>
                <Translations text='DialogContinueTitle' />
              </Typography>
              <Typography>
                <Translations text='DialogContinueText' />
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: 'center',
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <Button
              data-cy='dialog-submit'
              color='primary'
              variant='contained'
              sx={{ mr: 2 }}
              onClick={() => onPromoteSubmit(data.id)}
            >
              <Translations text='Submit' />
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleClose}>
              <Translations text='GoBack' />
            </Button>
          </DialogActions>
        </Dialog>
        <SchoolTransferCreateDialog
          errors={errors}
          isOpen={isSchoolTransferOpen}
          studentId={user_detail.data.id}
          sourceClassroomId={user_detail.data.classroom_id}
          handleClose={handleCloseSchoolModal}
          handleCreateSchoolTransfer={handleCreateSchoolTransfer}
        />
        <Grid container spacing={6}>
          <Grid item xs={12} md={12} lg={4}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                {data.avatar ? (
                  <CustomUserAvatar borderRadius={2} width={100} height={100} avatar={data.avatar} />
                ) : (
                  <CustomAvatar
                    skin='light'
                    src={data.avatar}
                    color={'primary' as ThemeColor}
                    sx={{
                      my: 3,
                      borderRadius: 2,
                      width: 100,
                      height: 100,
                      fontWeight: 500,
                      fontSize: theme => theme.typography.body1.fontSize
                    }}
                  >
                    {getInitials(data.first_name || 'Aman Amanow')}
                  </CustomAvatar>
                )}
                <Typography variant='h4' sx={{ mb: 3 }}>
                  {renderUserFullname(data.last_name, data.first_name, data.middle_name)}
                </Typography>
                <Box display='flex' flexDirection='row' flexWrap='wrap' justifyContent='center' gap={2}>
                  {userSchools &&
                    Object.keys(userSchools).map((role, index) => (
                      <CustomChip
                        key={index}
                        rounded
                        label={renderRole(role)}
                        skin='light'
                        color='secondary'
                        sx={{ mb: 3 }}
                        icon={<Icon icon='tabler:user-circle' fontSize={20} />}
                      />
                    ))}
                </Box>
                {data.schools.some(school => school.role_code === 'student') &&
                  data.tariff_end_at &&
                  data.tariff_type &&
                  new Date(data.tariff_end_at) > new Date() &&
                  data.tariff_end_at && (
                    <Tooltip arrow title={format(new Date(data.tariff_end_at), 'dd.MM.yyyy')} placement='top'>
                      <Box>
                        <CustomChip
                          rounded
                          label={data.tariff_type.toUpperCase()}
                          skin='light'
                          color='success'
                          sx={{ mb: 3 }}
                        />
                      </Box>
                    </Tooltip>
                  )}
                <Box display='flex' flexDirection='column' gap={2} width='100%'>
                  {data.role === 'student' && (
                    <Button
                      variant='tonal'
                      color='primary'
                      fullWidth
                      startIcon={<Icon icon='tabler:transform' />}
                      onClick={() => setIsSchoolTransferOpen(true)}
                    >
                      <Translations text='ChangeSchool' />
                    </Button>
                  )}
                  {data.role === 'teacher' && (
                    <Button
                      fullWidth
                      variant='tonal'
                      color='warning'
                      component={Link}
                      href={`/users/excuses/${data.id}`}
                      startIcon={<Icon icon='tabler:file-text' fontSize={20} />}
                    >
                      <Translations text='TeacherExcuses' />
                    </Button>
                  )}
                  {current_role === 'admin' &&
                    data.schools.some(school => {
                      return school.role_code === 'student'
                    }) && (
                      <Button
                        fullWidth
                        variant='tonal'
                        color='success'
                        sx={{ marginRight: 2 }}
                        onClick={() => setIsOpen(true)}
                        startIcon={<Icon icon='tabler:diamond' fontSize={20} />}
                      >
                        <Translations text='UpgradeToTariff' />
                      </Button>
                    )}
                </Box>
              </CardContent>

              <Divider sx={{ my: '0 !important', mx: 6 }} />

              <CardContent sx={{ pt: theme => `${theme.spacing(4)} !important` }}>
                <Box display='flex' flexDirection='column' gap={3}>
                  <Typography variant='body2'>
                    <Translations text='ProfileInformation' />
                  </Typography>
                  <Box display='flex' gap={1}>
                    <Typography fontWeight={600}>
                      <Translations text='School' />:
                    </Typography>
                    <Typography>{data?.school_name}</Typography>
                  </Box>
                  <Box display='flex' gap={1}>
                    <Typography fontWeight={600}>
                      <Translations text='Birthday' />:
                    </Typography>
                    <Typography>{data.birthday ? format(new Date(data.birthday), 'dd.MM.yyyy') : '-'}</Typography>
                  </Box>
                  <Box display='flex' gap={1}>
                    <Typography fontWeight={600}>
                      <Translations text='Phone' />:
                    </Typography>
                    <Typography>{renderPhone(data.phone)}</Typography>
                    <Box
                      component='span'
                      sx={{ mx: 1, color: `${data.phone_verified_at !== null ? 'success.main' : 'error.main'}` }}
                    >
                      <Icon icon='mdi:circle' fontSize='0.625rem' />
                    </Box>
                  </Box>
                  <Box display='flex' gap={1}>
                    <Typography fontWeight={600}>
                      <Translations text='Username' />:
                    </Typography>
                    <Typography>{renderUsername(data.username)}</Typography>
                  </Box>
                  <Box display='flex' gap={1}>
                    <Typography fontWeight={600}>
                      <Translations text='Status' />:
                    </Typography>
                    <Typography>{showStatusChip(data.status)}</Typography>
                  </Box>
                </Box>
              </CardContent>
              {ability?.can('write', 'admin_users') ? (
                <CardActions sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Button
                    sx={{ ml: '0!important' }}
                    variant='tonal'
                    color='secondary'
                    onClick={() => {
                      const currentParams = new URLSearchParams(window.location.search)

                      currentParams.set('page', '0')
                      currentParams.set('school_id', data.school_id || '')
                      currentParams.set('role', data.role || '')
                      currentParams.set('user_id', data.id)

                      router.push(
                        {
                          pathname: '/settings/user-logs',
                          query: currentParams.toString()
                        },
                        undefined,
                        { shallow: true }
                      )
                    }}
                    startIcon={<Icon icon='tabler:history' fontSize={20} />}
                  >
                    <Translations text='UserLogs' />
                  </Button>
                  <Button
                    sx={{ ml: '0!important' }}
                    variant='tonal'
                    component={Link}
                    href={`/users/edit/${data.id}`}
                    startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                  >
                    <Translations text='Edit' />
                  </Button>
                  <Button
                    variant='tonal'
                    color='error'
                    onClick={() => handleShowDialog(data)}
                    startIcon={<Icon icon='tabler:trash' fontSize={20} />}
                  >
                    <Translations text='Delete' />
                  </Button>
                </CardActions>
              ) : null}
            </Card>
          </Grid>
          <Grid item xs={12} md={12} lg={8}>
            <TabContext value={tabValue}>
              <Box display='flex' justifyContent='center'>
                <ButtonGroup variant='tonal' sx={{ justifySelf: 'center' }}>
                  <Button variant={tabValue === 'role' ? 'contained' : 'tonal'} onClick={() => handleChangeTab('role')}>
                    <Translations text='Role' />
                  </Button>
                  <Button
                    variant={tabValue === 'personal' ? 'contained' : 'tonal'}
                    onClick={() => handleChangeTab('personal')}
                  >
                    <Translations text='PersonalInformation' />
                  </Button>
                  <Button
                    variant={tabValue === 'documents' ? 'contained' : 'tonal'}
                    onClick={() => handleChangeTab('documents')}
                  >
                    <Translations text='Documents' />
                  </Button>
                  {userSchools['parent'] && (
                    <Button
                      variant={tabValue === 'children' ? 'contained' : 'tonal'}
                      onClick={() => handleChangeTab('children')}
                    >
                      <Translations text='Children' /> {`(${data.children.length})`}
                    </Button>
                  )}
                  {userSchools['student'] && (
                    <Button
                      variant={tabValue === 'parent' ? 'contained' : 'tonal'}
                      onClick={() => handleChangeTab('parent')}
                    >
                      <Translations text='Parents' /> {`(${data.parents.length})`}
                    </Button>
                  )}
                </ButtonGroup>
              </Box>
              <TabPanel value='role' sx={{ px: 0 }}>
                <RoleCard user_id={data.id} data={userSchools} subjects={subjects_lite_list.data} />
              </TabPanel>
              <TabPanel value='personal' sx={{ px: 0 }}>
                <Card>
                  <CardHeader
                    title={t('PersonalInformation')}
                    action={
                      <Button
                        sx={{ ml: '0!important' }}
                        variant='tonal'
                        component={Link}
                        href={`/users/edit/${data.id}`}
                        startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                      >
                        <Translations text='Edit' />
                      </Button>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={5}>
                      <Grid item xs={12} sm={12} md={6} lg={4}>
                        <Typography sx={{ color: 'text.secondary' }}>
                          <Translations text='Gender' />
                        </Typography>
                        <Typography>{renderGender(data.gender)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={4}>
                        <Typography sx={{ color: 'text.secondary' }}>
                          <Translations text='Email' />
                        </Typography>
                        {data.email ? (
                          <Box sx={{ display: 'flex' }}>
                            <Typography>{data.email}</Typography>
                            <Box
                              component='span'
                              sx={{
                                mx: 1,
                                color: `${data.email_verified_at !== null ? 'success.main' : 'error.main'}`
                              }}
                            >
                              <Icon icon='mdi:circle' fontSize='0.625rem' />
                            </Box>
                          </Box>
                        ) : (
                          '-'
                        )}
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={4}>
                        <Typography sx={{ color: 'text.secondary' }}>
                          <Translations text='District' />
                        </Typography>
                        <Typography>{data.district}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={4}>
                        <Typography sx={{ color: 'text.secondary' }}>
                          <Translations text='WorkTitle' />
                        </Typography>
                        <Typography>{data.work_title}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={4}>
                        <Typography sx={{ color: 'text.secondary' }}>
                          <Translations text='WorkPlace' />
                        </Typography>
                        <Typography>{data.work_place}</Typography>
                      </Grid>
                      {is_secondary_school === false && (
                        <>
                          <Grid item xs={12} sm={12} md={6} lg={4}>
                            <Typography sx={{ color: 'text.secondary' }}>
                              <Translations text='EducationTitle' />
                            </Typography>
                            <Typography>{data.education_title}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={12} md={6} lg={4}>
                            <Typography sx={{ color: 'text.secondary' }}>
                              <Translations text='EducationPlace' />
                            </Typography>
                            <Typography>{data.education_place}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={12} md={6} lg={4}>
                            <Typography sx={{ color: 'text.secondary' }}>
                              <Translations text='EducationGroup' />
                            </Typography>
                            <Typography>{data.education_group}</Typography>
                          </Grid>
                        </>
                      )}
                      <Grid item xs={12} sm={12} md={6} lg={4}>
                        <Typography sx={{ color: 'text.secondary' }}>
                          <Translations text='Reference' />
                        </Typography>
                        <Typography>{data.reference}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={12} md={8} lg={8}>
                        <Typography sx={{ color: 'text.secondary' }}>
                          <Translations text='Address' />
                        </Typography>
                        <Typography>{data.address ? data.address : '-'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </TabPanel>
              <TabPanel value='documents' sx={{ px: 0 }}>
                <Card>
                  <CardHeader
                    title={t('Documents')}
                    action={
                      <Button
                        sx={{ ml: '0!important' }}
                        variant='tonal'
                        component={Link}
                        href={`/users/edit/${data.id}`}
                        startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                      >
                        <Translations text='Edit' />
                      </Button>
                    }
                  />
                  <Divider />
                  {data.documents?.map((document, index) => (
                    <Box key={index}>
                      <CardContent>
                        <Grid container spacing={5}>
                          <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Typography sx={{ color: 'text.secondary' }}>
                              <Translations text={document.key} />
                            </Typography>
                            <Typography>{document.number}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Typography sx={{ color: 'text.secondary' }}>
                              <Translations text='Date' />
                            </Typography>
                            <Typography>{document.date}</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                      {data.documents?.length - 1 !== index && <Divider />}
                    </Box>
                  ))}
                  {data.document_files && data.document_files.length !== 0 && (
                    <>
                      <Divider />
                      <CardContent sx={{ p: 3, pb: '0.75rem!important' }}>
                        {data.document_files.map((file, index) => (
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
                    </>
                  )}
                </Card>
              </TabPanel>
              <TabPanel value='children' sx={{ px: 0 }}>
                <Card>
                  <CardHeader
                    title={`${t('Children')} (${data.children.length})`}
                    action={
                      <Button
                        sx={{ ml: '0!important' }}
                        variant='tonal'
                        component={Link}
                        href={`/users/edit/${data.id}`}
                        startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                      >
                        <Translations text='Edit' />
                      </Button>
                    }
                  />
                  <Divider />
                  {data.children.map((child, index) => (
                    <Box key={index}>
                      <CardContent>
                        <Grid container spacing={5}>
                          <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Typography sx={{ color: 'text.secondary' }}>
                              <Translations text='Fullname' />
                            </Typography>
                            <Typography
                              component={Link}
                              href={`/users/view/${child.id}`}
                              sx={{ fontWeight: '600', color: 'primary.main', textDecoration: 'none' }}
                            >
                              {renderUserFullname(child.last_name, child.first_name, child.middle_name)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Typography sx={{ color: 'text.secondary' }}>
                              <Translations text='School' />
                            </Typography>
                            <Typography>{child.school_name}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Typography sx={{ color: 'text.secondary' }}>
                              <Translations text='Classroom' />
                            </Typography>
                            <Typography>{child.classroom_name}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Typography sx={{ color: 'text.secondary' }}>
                              <Translations text='Birthday' />
                            </Typography>
                            <Typography>
                              {child.birthday ? format(new Date(child.birthday), 'dd.MM.yyyy') : '-'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                      {data.children?.length - 1 !== index && <Divider />}
                    </Box>
                  ))}
                </Card>
              </TabPanel>
              <TabPanel value='parent' sx={{ px: 0 }}>
                <Card>
                  <CardHeader
                    title={`${t('Parents')} (${data.parents.length})`}
                    action={
                      <Button
                        sx={{ ml: '0!important' }}
                        variant='tonal'
                        component={Link}
                        href={`/users/edit/${data.id}`}
                        startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                      >
                        <Translations text='Edit' />
                      </Button>
                    }
                  />
                  <Divider />
                  {data.parents.map((parent, index) => (
                    <Box key={index}>
                      <CardContent>
                        <Grid container spacing={5}>
                          <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Typography sx={{ color: 'text.secondary' }}>
                              <Translations text='Fullname' />
                            </Typography>
                            <Typography
                              component={Link}
                              href={`/users/view/${parent.id}`}
                              sx={{ fontWeight: '600', color: 'primary.main', textDecoration: 'none' }}
                            >
                              {renderUserFullname(parent.last_name, parent.first_name, parent.middle_name)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Typography sx={{ color: 'text.secondary' }}>
                              <Translations text='School' />
                            </Typography>
                            <Typography>{parent.school_name}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Typography sx={{ color: 'text.secondary' }}>
                              <Translations text='Phone' />
                            </Typography>
                            <Typography>{renderPhone(parent.phone)}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Typography sx={{ color: 'text.secondary' }}>
                              <Translations text='Birthday' />
                            </Typography>
                            <Typography>
                              {parent.birthday ? format(new Date(parent.birthday), 'dd.MM.yyyy') : '-'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                      {data.parents?.length - 1 !== index && <Divider />}
                    </Box>
                  ))}
                </Card>
              </TabPanel>
            </TabContext>
          </Grid>
        </Grid>
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

UserView.acl = {
  action: 'read',
  subject: 'admin_users'
}

export default UserView
