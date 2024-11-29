// ** React Imports
import { useEffect, useContext, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Import
import Icon from 'src/shared/components/icon'
import { renderPhone } from 'src/features/utils/ui/renderPhone'

// ** Types
import { SchoolType } from 'src/entities/school/SchoolType'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { deleteSchool, getCurrentSchool } from 'src/features/store/apps/school'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import { Box, CircularProgress, styled } from '@mui/material'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import { renderSchoolLevel } from 'src/features/utils/ui/renderSchoolLevel'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import toast from 'react-hot-toast'
import { useDialog } from 'src/app/context/DialogContext'
import dynamic from 'next/dynamic'
import CustomChip from 'src/shared/components/mui/chip'

import CustomAvatar from 'src/shared/components/mui/avatar'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { ThemeColor } from 'src/shared/layouts/types'

const Map = dynamic(() => import('src/widgets/general/map/Map'), { ssr: false })

const PreviewImg = styled('img')(() => ({}))

const SchoolView = () => {
  const [position, setPosition] = useState<number[] | null>(null)

  const router = useRouter()
  const id = router.query.schoolId
  const { school_detail } = useSelector((state: RootState) => state.schools)
  const data: SchoolType = { ...(school_detail.data as SchoolType) }

  const { t } = useTranslation()
  const showDialog = useDialog()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentSchool(id as string))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (
      !school_detail.loading &&
      school_detail.status === 'success' &&
      school_detail.data &&
      school_detail.data.latitude &&
      school_detail.data.longitude
    ) {
      setPosition([Number(school_detail.data.latitude), Number(school_detail.data.longitude)])
    }
  }, [school_detail])

  const handleShowDialog = async (id: string) => {
    const confirmed = await showDialog()
    if (confirmed && id) {
      handleDeleteSchool(id)
    }
  }

  const handleDeleteSchool = async (id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteSchool([id]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        router.push('/schools')
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  if (school_detail.error) {
    return <Error error={school_detail.error} />
  }

  if (!school_detail.loading && id) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CustomAvatar
                    skin='light'
                    src={data.avatar}
                    color={'primary' as ThemeColor}
                    sx={{
                      mr: 2.5,
                      borderRadius: 2,
                      width: 120,
                      height: 120,
                      fontWeight: 500,
                      fontSize: theme => theme.typography.body1.fontSize
                    }}
                  >
                    {data.name || 'Mekdep'}
                  </CustomAvatar>
                  <Box padding={4}>
                    <Typography variant='h3' display={'flex'} alignItems='center' sx={{ mb: 3, gap: 3 }} noWrap>
                      {data.name}
                      <CustomChip
                        rounded
                        size='medium'
                        label={data.is_secondary_school === true ? t('School') : t('EduCenter')}
                        skin='light'
                        color={data.is_secondary_school === true ? 'success' : 'primary'}
                      />
                    </Typography>
                    <Box display='flex' gap={3}>
                      <Typography variant='h5' alignItems='center'>
                        {data.parent?.name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('SchoolInformation')}
              action={
                ability.can('write', 'admin_schools') ? (
                  <Box display='flex' gap='15px'>
                    <Button
                      variant='tonal'
                      component={Link}
                      href={`/schools/edit/${data.id}`}
                      startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                    >
                      <Translations text='Edit' />
                    </Button>
                    <Button
                      color='error'
                      variant='tonal'
                      onClick={() => {
                        handleShowDialog(id as string)
                      }}
                      startIcon={<Icon icon='tabler:trash' fontSize={20} />}
                    >
                      <Translations text='Delete' />
                    </Button>
                  </Box>
                ) : null
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Code' />
                  </Typography>
                  <Typography>{data.code}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Fullname' />
                  </Typography>
                  <Typography>{data.full_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Phone' />
                  </Typography>
                  <Typography>{renderPhone(data.phone)}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Email' />
                  </Typography>
                  <Typography>{data.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Type' />
                  </Typography>
                  <Typography>{renderSchoolLevel(data.level)}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='RolePrincipal' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/users/view/${data.admin?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {renderUserFullname(data.admin?.last_name, data.admin?.first_name, data.admin?.middle_name)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Specialist' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/users/view/${data.specialist?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {renderUserFullname(
                      data.specialist?.last_name,
                      data.specialist?.first_name,
                      data.specialist?.middle_name
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Address' />
                  </Typography>
                  <Typography>{data.address}</Typography>
                </Grid>
                <Grid item xs={12} sm={8} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='IsDigitalized' />
                  </Typography>
                  <Typography>
                    {data.is_digitalized === true ? <Translations text='Yes' /> : <Translations text='No' />}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('Images')} />
            <Divider />
            <CardContent>
              {data.galleries && data.galleries.length > 0 ? (
                <Swiper
                  loop
                  navigation
                  pagination={{
                    type: 'bullets',
                    clickable: true,
                    renderBullet: (index, className) => {
                      return `<span class="${className}" style="height:5px!important;width:40px!important;border-radius:5px"></span>`
                    }
                  }}
                  modules={[Navigation, Pagination]}
                  style={{
                    height: 500,
                    width: '100%'
                  }}
                >
                  {data.galleries?.map((image, index) => (
                    <SwiperSlide key={index}>
                      <Box display='flex' height='100%' width='100%' alignItems='center' justifyContent='center'>
                        <PreviewImg
                          src={image}
                          alt={image}
                          sx={{ height: '100%', width: '100%', display: 'block', objectFit: 'contain' }}
                        />
                      </Box>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <Typography textAlign='center'>
                  <Translations text='NoRows' />
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('LocationAtMap')} />
            <Divider />
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={12}>
                  <Typography sx={{ mb: 3 }}>
                    {position && `${position ? position[0] : ''}, ${position ? position[1] : ''}`}
                  </Typography>
                  {position !== null ? (
                    <Box style={{ height: 536 }}>
                      <Map position={position} />
                    </Box>
                  ) : (
                    <Typography textAlign='center'>
                      <Translations text='NoRows' />
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
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

SchoolView.acl = {
  action: 'read',
  subject: 'admin_schools'
}

export default SchoolView
