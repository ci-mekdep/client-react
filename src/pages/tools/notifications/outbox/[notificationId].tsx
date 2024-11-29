// ** React Imports
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { CircularProgress, Pagination, styled } from '@mui/material'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import ButtonGroup from '@mui/material/ButtonGroup'

// ** Third Party Lib Imports
import format from 'date-fns/format'
import { useRouter } from 'next/router'
import PerfectScrollbarComponent from 'react-perfect-scrollbar'

// ** Custom Components Imports
import Icon from 'src/shared/components/icon'

// ** Type Imports
import { NotificationType } from 'src/entities/app/NotificationType'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import {
  deleteSentNotification,
  fetchOutboxNotification,
  fetchOutboxNotifications
} from 'src/features/store/apps/outboxNotifications'
import Translations from 'src/app/layouts/components/Translations'
import Error from 'src/widgets/general/Error'
import NewNotification from 'src/widgets/notifications/NewNotification'
import OutboxNotificationDetail from 'src/widgets/notifications/OutboxNotificationDetail'
import { MRT_PaginationState } from 'material-react-table'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { errorHandler } from 'src/features/utils/api/errorHandler'

const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  maxHeight: '70vh'
})

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
  const [isCreateNew, setIsCreateNew] = useState<boolean>(false)
  const [paginationModel, setPaginationModel] = useState({ limit: 12, offset: 0 })
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 12
  })

  // const [paginationModelReplies, setPaginationModelReplies] = useState({ page: 0, pageSize: 12 })
  const router = useRouter()
  const { t } = useTranslation()
  const { notificationId } = router.query
  const dispatch = useDispatch<AppDispatch>()
  const { inbox_notifications } = useSelector((state: RootState) => state.inboxNotifications)
  const { outbox_notifications } = useSelector((state: RootState) => state.outboxNotifications)

  useEffect(() => {
    setIsCreateNew(false)
    setPagination({ pageIndex: 0, pageSize: 12 })
  }, [notificationId])

  useEffect(() => {
    dispatch(fetchOutboxNotifications(paginationModel))
  }, [dispatch, paginationModel])

  const handleLoadNotifications = () => {
    dispatch(fetchOutboxNotifications(paginationModel))
    setIsCreateNew(false)
  }

  const handleChange = (event: ChangeEvent<unknown>, value: number) => {
    setPaginationModel(prev => {
      return {
        ...prev,
        offset: value - 1
      }
    })
  }

  const handleDeleteNotification = async (id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteSentNotification(id))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'))
        handleLoadNotifications()
        router.push('/tools/notifications/outbox/null')
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err))
      })
  }

  useEffect(() => {
    if (notificationId !== undefined && notificationId !== 'null') {
      const urlParams: any = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize
      }
      dispatch(fetchOutboxNotification({ id: notificationId as string, params: urlParams }))
    }
  }, [notificationId, dispatch, pagination])

  if (outbox_notifications.error) {
    return <Error error={outbox_notifications.error} />
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} lg={4} md={4} display='flex' flexDirection={'column'} gap={4}>
        <ButtonGroup variant='outlined' fullWidth>
          <Button
            size='medium'
            variant={'outlined'}
            onClick={() => {
              if (inbox_notifications.data && inbox_notifications.data[0]) {
                router.replace(`/tools/notifications/inbox/${inbox_notifications.data[0].id}`)
              } else {
                router.replace(`/tools/notifications/inbox/null`)
              }
            }}
            startIcon={<Icon icon='tabler:download' fontSize={20} />}
          >
            <Translations text='Received' />
          </Button>
          <Button size='medium' variant={'contained'} startIcon={<Icon icon='tabler:upload' fontSize={20} />}>
            <Translations text='Sent' />
          </Button>
        </ButtonGroup>
        <Button
          size='medium'
          variant='contained'
          onClick={() => {
            setIsCreateNew(true)
          }}
          startIcon={<Icon icon='tabler:edit' />}
        >
          <Translations text='SendNewNotification' />
        </Button>
        <Card>
          <ScrollWrapper hidden={false} ref={containerRef}>
            {outbox_notifications.loading ? (
              <CardContent>
                <CircularProgress
                  sx={{
                    width: '20px !important',
                    height: '20px !important'
                  }}
                />
              </CardContent>
            ) : outbox_notifications.data.length > 0 ? (
              outbox_notifications.data?.map((notification: NotificationType, index: number) => (
                <>
                  <CardContent
                    sx={{
                      backgroundColor:
                        notification.id === (notificationId as string) ? 'grey.A200' : 'background.default',
                      cursor: 'pointer',
                      p: 4
                    }}
                    onClick={() => {
                      router.push(`/tools/notifications/outbox/${notification.id}`)
                    }}
                  >
                    <Typography variant='h5' sx={{ mb: 2 }}>
                      {notification.title}
                    </Typography>
                    <Typography sx={{ color: 'text.disabled' }}>
                      {notification?.created_at && format(new Date(notification.created_at), 'HH:mm dd.MM.yyyy')}
                    </Typography>
                  </CardContent>
                  {outbox_notifications.data?.length - 1 !== index && <Divider />}
                </>
              ))
            ) : (
              <CardContent>
                <Typography textAlign={'center'}>
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
          count={Math.ceil(outbox_notifications?.total / paginationModel.limit)}
        />
      </Grid>
      <Grid item xs={12} lg={8} md={8}>
        {isCreateNew ? (
          <NewNotification handleLoadNotifications={handleLoadNotifications} />
        ) : (
          notificationId &&
          notificationId !== 'null' && (
            <OutboxNotificationDetail
              pagination={pagination}
              setPagination={setPagination}
              handleDeleteNotification={handleDeleteNotification}
            />
          )
        )}
      </Grid>
    </Grid>
  )
}

ToolsNotification.acl = {
  action: 'read',
  subject: 'tool_notifier'
}

export default ToolsNotification
