// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { Checkbox, FormControlLabel, styled } from '@mui/material'

// ** Third party libraries
import format from 'date-fns/format'
import toast from 'react-hot-toast'

// ** Custom Imports
import Icon from 'src/shared/components/icon'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'src/features/store'
import { useAuth } from 'src/features/hooks/useAuth'
import { SessionType } from 'src/entities/app/SessionType'
import { deleteSession } from 'src/features/store/apps/sessions'
import storageGetSessionId from 'src/features/utils/storage/storageGetSessionId'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import { useDialog } from 'src/app/context/DialogContext'
import { errorHandler } from 'src/features/utils/api/errorHandler'

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    height: 50
  }
}))

interface DeviceDetailProps {
  activeSession: SessionType
  setActiveSession: (data: null) => void
}

const ProfileViewDeviceDetail = (props: DeviceDetailProps) => {
  const { activeSession, setActiveSession } = props
  const { t } = useTranslation()
  const { removeData } = useAuth()
  const storageSessionId = storageGetSessionId()
  const showDialog = useDialog()
  const dispatch = useDispatch<AppDispatch>()

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
        setActiveSession(null)
        if (storageSessionId === activeSession.id) {
          removeData()
        }
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={
                <Icon
                  fontSize='1.25rem'
                  cursor={'pointer'}
                  icon='tabler:arrow-left'
                  onClick={() => setActiveSession(null)}
                />
              }
            />
            <CardContent data-cy='session-detail-card'>
              <Box sx={{ display: 'flex', gap: 8 }}>
                {activeSession.os !== 'Android' &&
                activeSession.os !== 'iOS' &&
                activeSession.os !== 'Linux' &&
                activeSession.os !== 'macOS' &&
                activeSession.os !== 'Tablet' &&
                activeSession.os !== 'Windows' ? (
                  <Img height={50} alt='device-logo' src={`/images/devices/Default.png`} />
                ) : (
                  <Img height={50} alt='device-logo' src={`/images/devices/${activeSession.os}.png`} />
                )}
                <Box>
                  <Typography variant='h6' fontWeight={600} marginBottom={2}>
                    {activeSession.os}
                  </Typography>
                  {activeSession.id === storageSessionId ? (
                    <FormControlLabel label={t('ActiveDevice')} control={<Checkbox checked={true} />} />
                  ) : null}
                  <Typography>
                    <Translations text='FirstLogin' />: {format(new Date(activeSession.iat), 'dd.MM.yyyy')}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: theme => `${theme.spacing(4)} !important` }} />
              <Box>
                <Typography fontWeight={600} marginBottom={4}>
                  <Translations text='LastAction' />
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Box sx={{ color: theme => theme.palette.primary.main }}>
                    <Icon icon='tabler:point-filled' width={15} />
                  </Box>
                  <Typography>{format(new Date(activeSession.lat), 'dd.MM.yyyy')}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: theme => `${theme.spacing(4)} !important` }} />
              <Box>
                <Typography fontWeight={600} marginBottom={4}>
                  <Translations text='BrowsersAppsServices' />
                </Typography>
                <Typography>{activeSession.browser}</Typography>
              </Box>
              <Grid item xs={12} textAlign='right' sx={{ pt: theme => `${theme.spacing(6.5)} !important` }}>
                <Button
                  size='small'
                  type='submit'
                  color='error'
                  variant='contained'
                  onClick={() => {
                    handleShowDialog([activeSession.id])
                  }}
                  startIcon={<Icon icon='tabler:logout' />}
                >
                  <Translations text='Delete' />
                </Button>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default ProfileViewDeviceDetail
