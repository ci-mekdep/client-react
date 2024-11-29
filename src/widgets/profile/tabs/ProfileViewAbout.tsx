// ** React Imports
import { useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Imports
import CustomChip from 'src/shared/components/mui/chip'
import Translations from 'src/app/layouts/components/Translations'

// ** Third party libraries
import format from 'date-fns/format'

// ** Type Imports
import { UserType } from 'src/entities/school/UserType'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { useAuth } from 'src/features/hooks/useAuth'
import { renderRole } from 'src/features/utils/ui/renderRole'
import { renderPhone } from 'src/features/utils/ui/renderPhone'
import { renderGender } from 'src/features/utils/ui/renderGender'
import { fetchProfile } from 'src/features/store/apps/profile'
import { renderUsername } from 'src/features/utils/ui/renderUsername'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import { Box, CircularProgress } from '@mui/material'

interface ProfileViewProps {
  handleChangeEdit: () => void
}

const ProfileViewAbout = (props: ProfileViewProps) => {
  const { profile } = useSelector((state: RootState) => state.profile)
  const data: UserType = (profile.data as { user: UserType }).user
  const { setUser } = useAuth()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  useEffect(() => {
    if (!profile.loading && profile.data && profile.status === 'success') {
      window.localStorage.setItem('userData', JSON.stringify(data))
      setUser({ ...data })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, setUser])

  if (profile.error) {
    return <Error error={profile.error} />
  }

  if (!profile.loading && data) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent
              sx={{
                display: 'flex',
                textAlign: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                p: theme => `${theme.spacing(9.75, 9.75, 9.25)} !important`
              }}
            >
              <Avatar src={data.avatar} variant='rounded' sx={{ width: 150, height: 150 }} />
              <Typography variant='h4' sx={{ my: 3 }} data-cy='profile-fullname'>
                {renderUserFullname(data.last_name, data.first_name, data.middle_name)}
              </Typography>
              <CustomChip rounded label={renderRole(data.role)} skin='light' color='secondary' />

              <Divider sx={{ m: theme => `${theme.spacing(9)} !important`, width: '100%' }} />

              <Grid container spacing={0} textAlign={'left'}>
                <Grid item xs={12} mb={4}>
                  <Typography variant='body2'>
                    <Translations text='DetailedInfo' />
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} mb={4} sx={{ display: 'flex' }}>
                  <Typography fontWeight='600' mr={2}>
                    <Translations text='Fullname' />:
                  </Typography>
                  <Typography data-cy='profile-detail-fullname'>
                    {renderUserFullname(data.last_name, data.first_name, data.middle_name)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} mb={4} sx={{ display: 'flex' }}>
                  <Typography fontWeight='600' mr={2}>
                    <Translations text='Gender' />:
                  </Typography>
                  <Typography data-cy='profile-detail-gender'>{renderGender(data.gender)}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} mb={4} sx={{ display: 'flex' }}>
                  <Typography fontWeight='600' mr={2}>
                    <Translations text='Username' />:
                  </Typography>
                  <Typography data-cy='profile-detail-username'>{renderUsername(data.username)}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} mb={4} sx={{ display: 'flex' }}>
                  <Typography fontWeight='600' mr={2}>
                    <Translations text='Birthday' />:
                  </Typography>
                  <Typography data-cy='profile-detail-birthday'>
                    {data.birthday ? format(new Date(data.birthday), 'dd.MM.yyyy') : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} mb={4} sx={{ display: 'flex' }}>
                  <Typography fontWeight='600' mr={2}>
                    <Translations text='Phone' />:
                  </Typography>
                  <Typography data-cy='profile-detail-phone'>{renderPhone(data.phone)}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} mb={4} sx={{ display: 'flex' }}>
                  <Typography fontWeight='600' mr={2}>
                    <Translations text='Email' />:
                  </Typography>
                  <Typography data-cy='profile-detail-email'>{data.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} mb={4} sx={{ display: 'flex' }}>
                  <Typography fontWeight='600' mr={2}>
                    <Translations text='Address' />:
                  </Typography>
                  <Typography data-cy='profile-detail-address'>{data.address}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'right' }}>
                  <Button
                    data-cy='profile-edit-btn'
                    variant='contained'
                    onClick={() => {
                      props.handleChangeEdit()
                    }}
                  >
                    <Translations text='Edit' />
                  </Button>
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

export default ProfileViewAbout
