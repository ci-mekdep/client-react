// ** React Imports
import { useEffect, useContext, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Import

// ** Types

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { Box, Button, CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import { SchoolTransferType, SchoolTransferUpdateType } from 'src/entities/app/SchoolTransferType'
import { getCurrentInboxSchoolTransfer, getCurrentSchoolTransfer, updateInboxSchoolTransfer } from 'src/features/store/apps/schoolTransfers'
import CustomChip from 'src/shared/components/mui/chip'
import i18n from 'i18next'
import format from 'date-fns/format'
import { useAuth } from 'src/features/hooks/useAuth'
import Icon from 'src/shared/components/icon'
import { ErrorKeyType, ErrorModelType } from 'src/entities/app/GeneralTypes'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import SchoolTransferAcceptDialog from 'src/widgets/school-transfers/SchoolTransferAcceptDialog'
import SchoolTransferRejectDialog from 'src/widgets/school-transfers/SchoolTransferRejectDialog'

const renderStatusChip = (val: string | null) => {
  if (val === 'waiting') {
    return <CustomChip skin='light' size='small' rounded label={i18n.t('StatusWaiting') as string} color='warning' />
  } else if (val === 'accepted') {
    return <CustomChip skin='light' size='small' rounded label={i18n.t('StatusAccepted') as string} color='success' />
  } else if (val === 'rejected') {
    return <CustomChip skin='light' size='small' rounded label={i18n.t('StatusRejected') as string} color='error' />
  }
}

const SchoolTransferView = () => {
  // ** State
  const [isAcceptOpen, setIsAcceptOpen] = useState<boolean>(false)
  const [isRejectOpen, setIsRejectOpen] = useState<boolean>(false)
  const [detailData, setDetailData] = useState<SchoolTransferType | null>(null)
  const [acceptErrors, setAcceptErrors] = useState<ErrorKeyType>({})
  const [rejectErrors, setRejectErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const { current_school } = useAuth()
  const id = router.query.schoolTransferId
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { school_transfer_inbox_detail } = useSelector((state: RootState) => state.schoolTransfers)
  const data: SchoolTransferType = { ...(school_transfer_inbox_detail.data as SchoolTransferType) }

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentInboxSchoolTransfer(id as string))
    }
  }, [dispatch, id])

  const handleDownloadFile = (file: string) => {
    const link = document.createElement('a')
    link.href = file
    link.download = ''
    link.target = '_blank'
    link.click()
  }

  const handleOpenAcceptDialog = () => {
    setIsAcceptOpen(true)
    setDetailData(school_transfer_inbox_detail.data)
  }

  const handleOpenRejectDialog = () => {
    setIsRejectOpen(true)
    setDetailData(school_transfer_inbox_detail.data)
  }

  const handleCloseAccept = () => {
    setIsAcceptOpen(false)
    setDetailData(null)
  }

  const handleCloseReject = () => {
    setIsRejectOpen(false)
    setDetailData(null)
  }

  const handleUpdateInboxSchoolTransfer = (data: SchoolTransferUpdateType) => {
    const toastId = toast.loading(t('ApiLoading'))
    dispatch(updateInboxSchoolTransfer({ data, id: id as string }))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        dispatch(getCurrentSchoolTransfer(id as string))
        setIsAcceptOpen(false)
        setIsRejectOpen(false)
      })
      .catch(err => {
        const errorObject: ErrorKeyType = {}
        err.errors?.map((err: ErrorModelType) => {
          if (err.key && err.code) {
            errorObject[err.key] = err.code
          }
        })
        setAcceptErrors(errorObject)
        setRejectErrors(errorObject)
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  if (school_transfer_inbox_detail.error) {
    return <Error error={school_transfer_inbox_detail.error} />
  }

  if (!school_transfer_inbox_detail.loading && id) {
    return (
      <>
        <SchoolTransferAcceptDialog
          isAcceptOpen={isAcceptOpen}
          handleCloseAccept={handleCloseAccept}
          detailData={detailData}
          errors={acceptErrors}
          handleUpdateInboxSchoolTransfer={handleUpdateInboxSchoolTransfer}
        />
        <SchoolTransferRejectDialog
          isRejectOpen={isRejectOpen}
          handleCloseReject={handleCloseReject}
          detailData={detailData}
          errors={rejectErrors}
          handleUpdateInboxSchoolTransfer={handleUpdateInboxSchoolTransfer}
        />
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={t('SchoolTransferInformation')}
                action={
                  ability.can('write', 'admin_school_transfers') &&
                  data.status === 'waiting' &&
                  current_school?.id === data.target_school?.id ? (
                    <Box display='flex' gap='15px'>
                      <Button
                        variant='tonal'
                        color='success'
                        onClick={() => handleOpenAcceptDialog()}
                        startIcon={<Icon icon='tabler:check' fontSize={20} />}
                      >
                        <Translations text='Accept' />
                      </Button>
                      <Button
                        variant='tonal'
                        color='error'
                        onClick={() => handleOpenRejectDialog()}
                        startIcon={<Icon icon='tabler:x' fontSize={20} />}
                      >
                        <Translations text='Reject' />
                      </Button>
                    </Box>
                  ) : null
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={5}>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='RoleStudent' />
                    </Typography>
                    <Typography
                      component={Link}
                      href={`/users/view/${data.student?.id}`}
                      color={'primary.main'}
                      sx={{ fontWeight: '600', textDecoration: 'none' }}
                    >
                      {renderUserFullname(data.student?.last_name, data.student?.first_name, data.student?.middle_name)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='TargetSchool' />
                    </Typography>
                    <Typography>
                      {data.target_school?.parent && `${data.target_school.parent.name}, `}
                      {data.target_school?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='TargetClassroom' />
                    </Typography>
                    <Typography>{data.target_classroom?.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='Status' />
                    </Typography>
                    <Typography>{renderStatusChip(data.status)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='SourceSchool' />
                    </Typography>
                    <Typography>
                      {data.source_school?.parent && `${data.source_school.parent.name}, `}
                      {data.source_school?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='SourceClassroom' />
                    </Typography>
                    <Typography>{data.source_classroom?.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='UserSent' />
                    </Typography>
                    <Typography
                      component={Link}
                      href={`/users/view/${data.sent_by?.id}`}
                      color={'primary.main'}
                      sx={{ fontWeight: '600', textDecoration: 'none' }}
                    >
                      {renderUserFullname(data.sent_by?.last_name, data.sent_by?.first_name, data.sent_by?.middle_name)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='SenderNote' />
                    </Typography>
                    <Typography>{data.sender_note}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='Files' />
                    </Typography>
                    <Box display='flex' flexDirection='column'>
                      {data.sender_files?.map((file, index) => (
                        <Typography
                          key={index}
                          onClick={() => handleDownloadFile(file)}
                          sx={{ color: 'primary.main', fontWeight: '600', textDecoration: 'none' }}
                        >
                          {file}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='ReceivedUser' />
                    </Typography>
                    <Typography>
                      {renderUserFullname(
                        data.received_by?.last_name,
                        data.received_by?.first_name,
                        data.received_by?.middle_name
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='ReceiverNote' />
                    </Typography>
                    <Typography>{data.receiver_note}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='SentTime' />
                    </Typography>
                    <Typography>{data.created_at && format(new Date(data.created_at), 'dd.MM.yyyy HH:mm')}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='UpdatedTime' />
                    </Typography>
                    <Typography>{data.updated_at && format(new Date(data.updated_at), 'dd.MM.yyyy HH:mm')}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
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

SchoolTransferView.acl = {
  action: 'read',
  subject: 'admin_school_transfers'
}

export default SchoolTransferView
