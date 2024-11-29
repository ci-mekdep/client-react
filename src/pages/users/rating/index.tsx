// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { Box, CardActions, CircularProgress, Divider } from '@mui/material'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Component Import
import CustomChip from 'src/shared/components/mui/chip'
import CustomAvatar from 'src/shared/components/mui/avatar'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { useAuth } from 'src/features/hooks/useAuth'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchRating } from 'src/features/store/apps/school/rating'
import { useSelector } from 'react-redux'
import { UserRatingType } from 'src/entities/school/UserType'
import Icon from 'src/shared/components/icon'
import Link from 'next/link'
import Error from 'src/widgets/general/Error'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import SelectSchoolWidget from 'src/widgets/general/SelectSchoolWidget'
import CustomUserAvatar from 'src/widgets/general/CustomUserAvatar'

const Rating = () => {
  // ** Hooks
  const { current_school } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const { rating_list } = useSelector((state: RootState) => state.rating)
  const { t } = useTranslation()

  useEffect(() => {
    dispatch(fetchRating())
  }, [dispatch])

  if (current_school === null) return <SelectSchoolWidget />

  if (rating_list.error) {
    return <Error error={rating_list.error} />
  }

  return (
    <Grid container spacing={6}>
      {!rating_list.loading && rating_list.data.length !== 0 ? (
        rating_list.data.map((user: UserRatingType, index: number) => (
          <Grid key={index} item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {user.user?.avatar ? (
                  <CustomUserAvatar marginBottom={4} height={200} avatar={user.user?.avatar} />
                ) : (
                  <CustomAvatar
                    skin='light'
                    variant='rounded'
                    color={'primary'}
                    sx={{ width: '100%', height: 200, mb: 4, fontSize: '3rem' }}
                  >
                    <Icon icon='tabler:user' fontSize='5rem' />
                  </CustomAvatar>
                )}
                <Typography
                  component={Link}
                  href={`/users/view/${user.user?.id}`}
                  variant='h5'
                  fontWeight={600}
                  color={'primary.main'}
                  sx={{ mb: 2, textDecoration: 'none' }}
                >
                  {renderUserFullname(user.user.last_name, user.user.first_name, user.user.middle_name)}
                </Typography>
                <Typography>
                  <Translations text='Classroom' />: {user.classroom?.name}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  p: theme => `${theme.spacing(4)} !important`
                }}
              >
                <Typography color={'primary'}>
                  <Translations text='Points' />: {user.value}
                </Typography>
                <CustomChip rounded label={user.rating + ' ' + t('Place')} color='success' />
              </CardActions>
            </Card>
          </Grid>
        ))
      ) : !rating_list.loading && rating_list.data.length === 0 ? (
        <Box
          sx={{
            width: '100%',
            height: '10vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Translations text='NoGradesForRating' />
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Grid>
  )
}

Rating.acl = {
  action: 'read',
  subject: 'rating'
}

export default Rating
