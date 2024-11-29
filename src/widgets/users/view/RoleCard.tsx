// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Third Party Libs Imports
import { useTranslation } from 'react-i18next'

// ** Util Imports

// ** Type Imports
import { UserRolesType } from 'src/entities/school/UserSchoolType'
import Link from 'next/link'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { Box, Button } from '@mui/material'
import Translations from 'src/app/layouts/components/Translations'
import CustomAvatar from 'src/shared/components/mui/avatar'
import Icon from 'src/shared/components/icon'

interface PropsType {
  user_id: string
  data: UserRolesType
  subjects: LiteModelType[] | null
}

const RoleCard = (props: PropsType) => {
  const { user_id, data, subjects } = props
  const { t } = useTranslation()

  return (
    <Grid container spacing={6}>
      {Object.entries(data).length > 0 ? (
        Object.entries(data).map(([key, value]) => (
          <>
            <Grid item xs={12} key={key}>
              <Card>
                <CardHeader
                  title={`${t(`Role${key[0].toUpperCase() + key.slice(1)}`)} ${
                    key === 'admin' ? `(${t('AllSchools')})` : ''
                  }`}
                  action={
                    <Button
                      sx={{ ml: '0!important' }}
                      variant='tonal'
                      component={Link}
                      href={`/users/edit/${user_id}`}
                      startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                    >
                      <Translations text='Edit' />
                    </Button>
                  }
                />
                {key !== 'admin' && (
                  <>
                    <Divider />
                    {value.map((item, index) => (
                      <Box key={index}>
                        <CardContent>
                          <Grid container spacing={5}>
                            <Grid item xs={12} sm={12} md={6} lg={6}>
                              <Typography sx={{ color: 'text.secondary' }}>
                                <Translations text={key !== 'organization' ? 'School' : 'Region'} />
                              </Typography>
                              <Typography>{item.school?.value}</Typography>
                            </Grid>
                            {(key === 'student' || key === 'teacher') && (
                              <Grid item xs={12} sm={12} md={6} lg={6}>
                                <Typography sx={{ color: 'text.secondary' }}>
                                  <Translations text={'Classroom'} />
                                </Typography>
                                <Typography>{item.classroom?.value}</Typography>
                              </Grid>
                            )}
                            {key === 'teacher' && subjects !== null && (
                              <Grid item xs={12} sm={12} md={6} lg={6}>
                                <Typography sx={{ color: 'text.secondary' }}>
                                  <Translations text='Subjects' />
                                </Typography>
                                <Box display='flex' flexDirection='column'>
                                  {subjects.map(subject => (
                                    <Typography
                                      component={Link}
                                      href={`/subjects/view/${subject.key}`}
                                      color={'primary.main'}
                                      sx={{ fontWeight: '600', textDecoration: 'none' }}
                                      key={subject.key}
                                    >
                                      {subject.value}
                                    </Typography>
                                  ))}
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                        {value?.length - 1 !== index && <Divider />}
                      </Box>
                    ))}
                  </>
                )}
              </Card>
            </Grid>
          </>
        ))
      ) : (
        <Grid item xs={12}>
          <Card sx={{ mx: 'auto' }}>
            <CardContent>
              <Box display='flex' alignItems='center' justifyContent='center' flexDirection='column' gap={4}>
                <CustomAvatar variant='rounded' skin='light' sx={{ width: 52, height: 52 }}>
                  <Icon icon='tabler:user-filled' fontSize='2rem' />
                </CustomAvatar>
                <Typography variant='h4' textAlign='center' fontWeight={600}>
                  <Translations text='NoRole' />
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}

export default RoleCard
