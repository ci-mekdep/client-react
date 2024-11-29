// ** React Imports
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { CircularProgress, Pagination, styled } from '@mui/material'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import ButtonGroup from '@mui/material/ButtonGroup'

// ** Third Party Lib Imports
import format from 'date-fns/format'
import { useRouter } from 'next/router'

// ** Icon Imports
import Icon from 'src/shared/components/icon'
import PerfectScrollbarComponent from 'react-perfect-scrollbar'

// ** Type Imports
import { UserNotificationCreateType, UserNotificationType } from 'src/entities/app/NotificationType'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchOutboxNotifications } from 'src/features/store/apps/outboxNotifications'
import { fetchInboxNotifications, readInboxNotifications } from 'src/features/store/apps/inboxNotifications'
import Translations from 'src/app/layouts/components/Translations'
import Error from 'src/widgets/general/Error'
import InboxNotificationDetail from 'src/widgets/notifications/InboxNotificationDetail'

const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  maxHeight: '70vh'
})

const defaultValues = {
  comment: ''
}

const ScrollWrapper = ({ children, hidden, ref }: { children: ReactNode; hidden: boolean; ref: any }) => {
  if (hidden) {
    return <Box sx={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
  } else {
    return (
      <PerfectScrollbar ref={ref} options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const ToolsNotification = () => {
  const containerRef = useRef()
  const [unreadIds, setUnreadIds] = useState<string[]>([])
  const [formData, setFormData] = useState<UserNotificationCreateType>(defaultValues)
  const [paginationModel, setPaginationModel] = useState({ limit: 12, offset: 0 })
  const [activeNotification, setActiveNotification] = useState<UserNotificationType | null>(null)

  // ** Hooks
  const router = useRouter()
  const { notificationId } = router.query
  const dispatch = useDispatch<AppDispatch>()
  const { outbox_notifications } = useSelector((state: RootState) => state.outboxNotifications)
  const { inbox_notifications } = useSelector((state: RootState) => state.inboxNotifications)

  useEffect(() => {
    dispatch(fetchInboxNotifications(paginationModel))
  }, [dispatch, paginationModel])

  useEffect(() => {
    dispatch(
      fetchOutboxNotifications({
        limit: 12,
        offset: 0
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (!inbox_notifications.loading && inbox_notifications.status === 'success' && inbox_notifications.data) {
      setUnreadIds(
        inbox_notifications.data
          ?.filter((notification: UserNotificationType) => notification.read_at === null)
          .map((notification: UserNotificationType) => notification.id)
      )
    }
  }, [inbox_notifications.data, inbox_notifications.loading, inbox_notifications.status])

  useEffect(() => {
    if (notificationId !== undefined) {
      dispatch(readInboxNotifications({ ids: notificationId, read: 1 }))
    }
  }, [dispatch, notificationId])

  useEffect(() => {
    if (notificationId !== undefined) {
      setActiveNotification(
        inbox_notifications.data?.find(
          (notification: UserNotificationType) => notification.id == (notificationId as string)
        )
      )
      setUnreadIds(prev => prev.filter(id => id !== (notificationId as string)))
    }
  }, [inbox_notifications.data, notificationId])

  useEffect(() => {
    activeNotification &&
      setFormData({
        comment: activeNotification.comment
      })
  }, [activeNotification])

  const handleChange = (event: ChangeEvent<unknown>, value: number) => {
    setPaginationModel(prev => {
      return {
        ...prev,
        offset: value - 1
      }
    })
  }

  if (inbox_notifications.error) {
    return <Error error={inbox_notifications.error} />
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} lg={4} md={4} display='flex' flexDirection={'column'} gap={4}>
        <ButtonGroup variant='outlined' fullWidth>
          <Button size='medium' variant='contained' startIcon={<Icon icon='tabler:download' fontSize={20} />}>
            <Translations text='Received' />
          </Button>
          <Button
            size='medium'
            variant='outlined'
            onClick={() => {
              if (outbox_notifications.data && outbox_notifications.data[0]) {
                router.replace(`/tools/notifications/outbox/${outbox_notifications.data[0].id}`)
              } else {
                router.replace(`/tools/notifications/outbox/null`)
              }
            }}
            startIcon={<Icon icon='tabler:upload' fontSize={20} />}
          >
            <Translations text='Sent' />
          </Button>
        </ButtonGroup>
        <Card>
          <ScrollWrapper hidden={false} ref={containerRef}>
            {inbox_notifications.loading ? (
              <CardContent>
                <CircularProgress
                  sx={{
                    width: '20px !important',
                    height: '20px !important'
                  }}
                />
              </CardContent>
            ) : inbox_notifications.data.length > 0 ? (
              inbox_notifications.data?.map((notification: UserNotificationType, index: number) => (
                <>
                  <CardContent
                    sx={{
                      backgroundColor:
                        notification.id === (notificationId as string) ? 'grey.A200' : 'background.default',
                      cursor: 'pointer',
                      p: 4
                    }}
                    onClick={() => {
                      setFormData(defaultValues)
                      router.push(`/tools/notifications/inbox/${notification.id}`)
                    }}
                  >
                    <Badge
                      variant='dot'
                      color='primary'
                      invisible={!unreadIds.includes(notification.id)}
                      sx={{
                        width: '100%',
                        '& .MuiBadge-badge': {
                          top: 4,
                          right: -4,
                          boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`
                        }
                      }}
                    >
                      <Typography variant='h5' sx={{ mb: 2 }}>
                        {notification.notification?.title}
                      </Typography>
                    </Badge>
                    <Typography sx={{ color: 'text.disabled' }}>
                      {notification?.notification?.created_at &&
                        format(new Date(notification.notification.created_at), 'dd.MM.yyyy HH:mm')}
                    </Typography>
                  </CardContent>
                  {inbox_notifications.data.length - 1 !== index && <Divider />}
                </>
              ))
            ) : (
              <CardContent>
                <Typography textAlign='center'>
                  <Translations text='NoRows' />
                </Typography>
              </CardContent>
            )}
          </ScrollWrapper>
        </Card>
        <Pagination
          color='primary'
          shape='rounded'
          variant='outlined'
          onChange={handleChange}
          page={paginationModel.offset + 1}
          count={Math.ceil(inbox_notifications?.total / paginationModel.limit)}
        />
      </Grid>
      <InboxNotificationDetail
        formData={formData}
        setFormData={setFormData}
        notificationId={notificationId}
        activeNotification={activeNotification}
      />
    </Grid>
  )
}

ToolsNotification.acl = {
  action: 'read',
  subject: 'tool_notifier'
}

export default ToolsNotification
