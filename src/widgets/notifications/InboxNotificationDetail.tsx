import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Typography,
  styled
} from '@mui/material'
import format from 'date-fns/format'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import Translations from 'src/app/layouts/components/Translations'
import { UserNotificationCreateType, UserNotificationType } from 'src/entities/app/NotificationType'
import { AppDispatch, RootState } from 'src/features/store'
import { replyInboxNotification } from 'src/features/store/apps/inboxNotifications'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'

// ** Icon Imports
import Icon from 'src/shared/components/icon'
import CustomTextField from 'src/shared/components/mui/text-field'

interface PropsType {
  formData: UserNotificationCreateType
  setFormData: (data: any) => void
  notificationId: string[] | string | undefined
  activeNotification: UserNotificationType | null
}

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    height: 40
  }
}))

const InboxNotificationDetail = (props: PropsType) => {
  const [filesToSend, setFilesToSend] = useState<File[]>([])
  const { formData, setFormData, notificationId, activeNotification } = props

  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { reply_notification } = useSelector((state: RootState) => state.inboxNotifications)

  useEffect(() => {
    setFormData({ comment: activeNotification?.comment })
    setFilesToSend([])
  }, [activeNotification?.comment, setFormData])

  const handleFormChange = (
    field: keyof UserNotificationCreateType,
    value: UserNotificationCreateType[keyof UserNotificationCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleInputImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files !== null && Array.from(e.target.files)
    setFilesToSend([...filesToSend, ...(selectedFiles as File[])])
  }

  const handleDeleteFile = (file: File) => {
    const newFiles = filesToSend.filter(f => f.name !== file.name)
    setFilesToSend(newFiles)
  }

  const handleDownloadFile = (file: string) => {
    const link = document.createElement('a')
    link.href = file
    link.download = ''
    link.target = '_blank'
    link.click()
  }

  const onSubmit = (data: UserNotificationCreateType) => {
    const formDataToSend = new FormData()
    if (data) {
      formDataToSend.append('comment', data.comment)
      filesToSend.map(fileToSend => {
        formDataToSend.append('comment_files', fileToSend)
      })
    }

    dispatch(replyInboxNotification({ data: formDataToSend, id: notificationId as string }))
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        setFormData({ comment: res.payload.item.comment })
      })
      .catch(() => {
        toast.error(t('ApiErrorDefault'), {
          duration: 2000
        })
      })
  }

  return (
    <Grid item xs={12} lg={8} md={8}>
      {notificationId && activeNotification && activeNotification.notification && (
        <Grid>
          <Card sx={{ mb: 6 }}>
            <CardContent>
              <Box marginBottom={4}>
                <Typography variant='h5' mb={2}>
                  {activeNotification?.notification.title}
                </Typography>
                <Typography mb={6}>{activeNotification?.notification.content}</Typography>
                <Typography variant='body2' fontWeight={600} mb={2}>
                  {renderUserFullname(
                    activeNotification?.notification?.author.last_name,
                    activeNotification?.notification?.author.first_name,
                    activeNotification?.notification?.author.middle_name
                  )}{' '}
                  <Translations text='By' />
                </Typography>
                <Typography variant='body2' fontWeight={600} mb={6}>
                  {activeNotification?.notification?.created_at &&
                    format(new Date(activeNotification.notification.created_at), 'dd.MM.yyyy HH:mm') +
                      ` ${t('SentAt')}`}
                </Typography>
                {activeNotification?.notification?.files.length > 0 && (
                  <Card>
                    <CardHeader
                      title={
                        <Typography variant='h6'>
                          <Translations text='SelectedFiles' />
                        </Typography>
                      }
                      sx={{ p: 3 }}
                    />
                    <Divider />
                    <CardContent sx={{ p: 3 }}>
                      {activeNotification.notification?.files.map((file, index) => (
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
                          {file.split('/')[file.split('/').length - 1]}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </Box>
            </CardContent>
          </Card>
          <Card>
            <form
              autoComplete='off'
              onSubmit={e => {
                e.preventDefault()
                onSubmit(formData as UserNotificationCreateType)
              }}
            >
              <CardContent>
                <Box>
                  <CustomTextField
                    fullWidth
                    multiline
                    minRows={6}
                    label={
                      <Typography variant='h5'>
                        <Translations text='Note' />
                      </Typography>
                    }
                    placeholder={t('WriteText') as string}
                    value={formData.comment}
                    onChange={e => handleFormChange('comment', e.target.value)}
                    sx={{ mb: 4, '& .MuiInputBase-root.MuiFilledInput-root': { alignItems: 'baseline' } }}
                  />
                  {activeNotification?.comment_files && activeNotification?.comment_files.length > 0 && (
                    <Card sx={{ mb: 4 }}>
                      <CardHeader
                        title={
                          <Typography variant='h6'>
                            <Translations text='SelectedFiles' />
                          </Typography>
                        }
                        sx={{ p: 3 }}
                      />
                      <Divider />
                      <CardContent sx={{ p: 3 }}>
                        {activeNotification.comment_files.map((file, index) => (
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
                            {file.split('/')[file.split('/').length - 1]}
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
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
                  <Box textAlign='right'>
                    <Button
                      variant='contained'
                      color='success'
                      type='submit'
                      sx={{ mr: 4, mt: 4 }}
                      disabled={reply_notification.loading}
                      startIcon={<Icon icon='tabler:send' />}
                    >
                      {reply_notification.loading ? (
                        <CircularProgress
                          sx={{
                            width: '20px !important',
                            height: '20px !important',
                            mr: theme => theme.spacing(2)
                          }}
                        />
                      ) : null}
                      <Translations text='Send' />
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </form>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}

export default InboxNotificationDetail
