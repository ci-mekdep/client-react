// ** React Imports
import { useContext, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { Box, CircularProgress, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Third party libraries

// ** Custom Imports
import Icon from 'src/shared/components/icon'

// ** Store
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import Link from 'next/link'
import { useAuth } from 'src/features/hooks/useAuth'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { renderPhone } from 'src/features/utils/ui/renderPhone'
import { renderSchoolLevel } from 'src/features/utils/ui/renderSchoolLevel'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { SchoolType } from 'src/entities/school/SchoolType'
import { getCurrentSchool } from 'src/features/store/apps/school'

const ProfileViewSchool = () => {
  const { t } = useTranslation()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { current_school, current_role } = useAuth()
  const { school_detail } = useSelector((state: RootState) => state.schools)
  const school_data: SchoolType = { ...(school_detail.data as SchoolType) }

  useEffect(() => {
    if (current_school && current_school.id !== undefined && current_school.id !== null) {
      dispatch(getCurrentSchool(current_school.id.toString()))
    }
  }, [current_school, dispatch])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={t('ProfilePagesSchool')}
            action={
              (school_data && current_role === 'principal') ||
              (ability.can('write', 'admin_schools') && current_school) ? (
                <Box display='flex'>
                  <Button
                    variant='contained'
                    component={Link}
                    href={`/schools/edit/profile/${school_data.id}`}
                    startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                  >
                    <Translations text='EditSchoolData' />
                  </Button>
                </Box>
              ) : null
            }
          />
          <CardContent data-cy='profile-school-details'>
            {school_detail.loading ? (
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
            ) : school_detail.status === 'success' &&
              school_data &&
              current_school &&
              school_data.id === current_school.id ? (
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Code' />
                  </Typography>
                  <Typography>{school_data.code}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Name' />
                  </Typography>
                  <Typography>{school_data.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Fullname' />
                  </Typography>
                  <Typography>{school_data.full_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='BelongRegion' />
                  </Typography>
                  <Typography>{school_data.parent?.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Phone' />
                  </Typography>
                  <Typography>{renderPhone(school_data.phone)}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Email' />
                  </Typography>
                  <Typography>{school_data.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Type' />
                  </Typography>
                  <Typography>{renderSchoolLevel(school_data.level)}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='RolePrincipal' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/users/view/${school_data.admin?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {renderUserFullname(
                      school_data.admin?.last_name,
                      school_data.admin?.first_name,
                      school_data.admin?.middle_name
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Specialist' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/users/view/${school_data.specialist?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {renderUserFullname(
                      school_data.specialist?.last_name,
                      school_data.specialist?.first_name,
                      school_data.specialist?.middle_name
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Address' />
                  </Typography>
                  <Typography>{school_data.address}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '20vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography data-cy='school-not-selected'>
                  <Translations text='SchoolNotSelected' />
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProfileViewSchool
