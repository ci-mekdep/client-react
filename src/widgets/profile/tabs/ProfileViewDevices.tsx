// ** React Imports
import { useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { Box, Checkbox, CircularProgress, Divider, FormControlLabel, styled } from '@mui/material'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Third party libraries
import toast from 'react-hot-toast'
import format from 'date-fns/format'

// ** Custom Imports
import Icon from 'src/shared/components/icon'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { deleteSession, fetchSessions } from 'src/features/store/apps/sessions'
import { convertSessionData } from 'src/features/utils/api/convertSessionData'
import storageGetSessionId from 'src/features/utils/storage/storageGetSessionId'
import { SessionType } from 'src/entities/app/SessionType'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { useDialog } from 'src/app/context/DialogContext'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import { errorHandler } from 'src/features/utils/api/errorHandler'

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    height: 50
  }
}))

interface DevicesProps {
  setActiveSession: (data: SessionType) => void
}

const ProfileViewDevices = (props: DevicesProps) => {
  const { setActiveSession } = props
  const { sessions_list, delete_session } = useSelector((state: RootState) => state.sessions)
  const sessions: any[] = convertSessionData(sessions_list.data)

  const sessionId = storageGetSessionId()
  const showDialog = useDialog()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchSessions())
  }, [dispatch])

  const handleShowDialog = async (arr?: string[]) => {
    const confirmed = await showDialog()
    if (confirmed) {
      if (arr) {
        handleDeleteSessions(arr)
      }
    }
  }

  const handleDeleteSessions = async (arr: string[]) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteSession(arr))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        dispatch(fetchSessions())
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  if (sessions_list.error) {
    return <Error error={sessions_list.error} />
  }

  if (!sessions_list.loading && sessions) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('DeviceCardTitle')}
              action={
                <Button
                  variant='contained'
                  data-cy='delete-sessions'
                  onClick={() =>
                    handleShowDialog(
                      sessions_list.data
                        .filter((obj: SessionType) => obj.id != sessionId)
                        .map((obj: SessionType) => obj.id)
                    )
                  }
                  startIcon={<Icon icon='tabler:logout' fontSize={20} />}
                  disabled={delete_session.loading}
                >
                  {delete_session.loading ? (
                    <CircularProgress
                      sx={{
                        width: '20px !important',
                        height: '20px !important',
                        mr: theme => theme.spacing(2)
                      }}
                    />
                  ) : null}
                  <Translations text='LogoutFromAll' />
                </Button>
              }
            />
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={12}>
                  {sessions?.map((session: any, index: number) => (
                    <Card data-cy='session-card' key={index} sx={{ mb: theme => `${theme.spacing(6)} !important` }}>
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Grid container spacing={10} alignItems={'center'}>
                              <Grid item xs={12} sm={3} md={3} lg={2.5} xl={2.5}>
                                {session.os !== 'Android' &&
                                session.os !== 'iOS' &&
                                session.os !== 'Linux' &&
                                session.os !== 'macOS' &&
                                session.os !== 'Tablet' &&
                                session.os !== 'Windows' ? (
                                  <Img height={50} alt='device-logo' src={`/images/devices/Default.png`} />
                                ) : (
                                  <Img height={50} alt='device-logo' src={`/images/devices/${session.os}.png`} />
                                )}
                              </Grid>
                              <Grid item xs={12} sm={9} md={9} lg={9.5} xl={9.5}>
                                <Typography variant='h6' fontWeight={600}>
                                  {session.os} {session.data.length} <Translations text='DevicesCount' />.
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            {session.data.map((s: SessionType, i: number) => (
                              <>
                                <Grid key={s.id} container alignItems={'center'} sx={{ textDecoration: 'none' }}>
                                  <Grid item xs={11}>
                                    <Typography variant='h6' fontWeight={600}>
                                      {s.os}
                                    </Typography>
                                    <Typography>{s.browser}</Typography>
                                    {s.id === sessionId ? (
                                      <FormControlLabel
                                        label={t('ActiveDevice')}
                                        control={<Checkbox checked={true} />}
                                      />
                                    ) : (
                                      <Typography>{format(new Date(s.iat), 'dd.MM.yyyy')}</Typography>
                                    )}
                                  </Grid>
                                  <Grid item xs={1}>
                                    <Icon
                                      data-cy={s.id === sessionId ? 'active-session-detail-btn' : 'session-detail-btn'}
                                      icon='tabler:chevron-right'
                                      cursor={'pointer'}
                                      onClick={() => {
                                        setActiveSession(s)
                                      }}
                                    />
                                  </Grid>
                                </Grid>
                                {session.data.length - 1 !== i && (
                                  <Divider sx={{ my: theme => `${theme.spacing(4)} !important` }} />
                                )}
                              </>
                            ))}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
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

export default ProfileViewDevices
