// ** React Imports
import { useEffect, useContext, forwardRef, ReactElement, Ref, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Import
import Icon from 'src/shared/components/icon'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import Translations from 'src/app/layouts/components/Translations'
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  Fade,
  FadeProps,
  IconButton,
  IconButtonProps,
  styled
} from '@mui/material'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import { TopicType } from 'src/entities/journal/TopicType'
import { deleteTopic, getCurrentTopic } from 'src/features/store/apps/topics'
import Markdown from 'react-markdown'
import { renderLangType } from 'src/features/utils/ui/renderLangType'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { useDialog } from 'src/app/context/DialogContext'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

const CustomCloseButton = styled(IconButton)<IconButtonProps>(({ theme }) => ({
  top: 0,
  right: 0,
  color: 'grey.500',
  position: 'absolute',
  boxShadow: theme.shadows[2],
  transform: 'translate(10px, -10px)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette.background.paper} !important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'translate(7px, -5px)'
  }
}))

const TopicView = () => {
  const router = useRouter()
  const id = router.query.topicId
  const [show, setShow] = useState<boolean>(false)
  const { topic_detail } = useSelector((state: RootState) => state.topics)
  const data: TopicType = { ...(topic_detail.data as TopicType) }

  const { t } = useTranslation()
  const showDialog = useDialog()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const defaultLayoutPluginInstance = defaultLayoutPlugin()

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentTopic(id as string))
    }
  }, [dispatch, id])

  const handleDownloadFile = (file: string) => {
    const link = document.createElement('a')
    link.href = file
    link.download = ''
    link.target = '_blank'
    link.click()
  }

  const handleShowDialog = async (id: string) => {
    const confirmed = await showDialog()
    if (confirmed && id) {
      handleDeleteTopic(id)
    }
  }

  const handleDeleteTopic = async (id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteTopic([id]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        router.push('/settings/topics')
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  if (topic_detail.error) {
    return <Error error={topic_detail.error} />
  }

  if (!topic_detail.loading && id) {
    return (
      <>
        <Dialog
          fullWidth
          open={show}
          maxWidth='md'
          scroll='body'
          onClose={() => setShow(false)}
          TransitionComponent={Transition}
          onBackdropClick={() => setShow(false)}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
          <DialogContent
            sx={{
              pb: theme => `${theme.spacing(8)} !important`,
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(5)} !important`],
              pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <CustomCloseButton onClick={() => setShow(false)}>
              <Icon icon='tabler:x' fontSize='1.25rem' />
            </CustomCloseButton>
            <Typography textAlign='center' variant='h3' fontWeight={600} mb={3}>
              {data.book?.title}
            </Typography>
            {data.book && data.book.file !== null && (
              <Box>
                <Worker workerUrl={'/pdf.worker.min.js'}>
                  <Box
                    sx={{
                      height: '80vh',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }}
                  >
                    <Viewer
                      initialPage={data.book_page ? data.book_page : 1}
                      fileUrl={data.book?.file}
                      defaultScale={1}
                      plugins={[defaultLayoutPluginInstance]}
                    />
                  </Box>
                </Worker>
              </Box>
            )}
          </DialogContent>
        </Dialog>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card sx={{ mb: 5 }}>
              <CardHeader
                title={t('TopicInformation') as string}
                action={
                  ability.can('write', 'admin_topics') ? (
                    <Box display='flex' gap='15px'>
                      <Button
                        variant='tonal'
                        component={Link}
                        href={`/topics/edit/${data.id}`}
                        startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                      >
                        <Translations text='Edit' />
                      </Button>
                      <Button
                        color='error'
                        variant='tonal'
                        onClick={() => {
                          handleShowDialog(id as string)
                        }}
                        startIcon={<Icon icon='tabler:trash' fontSize={20} />}
                      >
                        <Translations text='Delete' />
                      </Button>
                    </Box>
                  ) : null
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={5}>
                  <Grid item xs={12} sm={6} md={8} lg={8}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='Name' />
                    </Typography>
                    <Typography>{data.title}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='Subject' />
                    </Typography>
                    <Typography>{data.subject}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='ClassroomLangType' />
                    </Typography>
                    <Typography>{renderLangType(data.language)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='Classroom' />
                    </Typography>
                    <Typography>{data.classyear}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='Quarter' />
                    </Typography>
                    <Typography>{data.period}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='Level' />
                    </Typography>
                    <Typography>{data.level}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='Tags' />
                    </Typography>
                    <Typography>
                      {data.tags &&
                        data.tags.map((tag, index) => {
                          return (
                            <Typography key={index}>
                              {tag}
                              {data.tags && data.tags.length - 1 !== index && ', '}
                            </Typography>
                          )
                        })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='Book' />
                    </Typography>
                    <Typography
                      color={'primary.main'}
                      onClick={() => {
                        setShow(true)
                      }}
                      sx={{ cursor: 'pointer', fontWeight: '600', textDecoration: 'none' }}
                    >
                      {data.book?.title} {data.book_page ? `(${data.book_page})` : ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='Description' />
                    </Typography>
                    <Markdown>{data.content}</Markdown>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            {data.files && data.files.length !== 0 && (
              <Card>
                <CardHeader title={t('SelectedFiles')} />
                <Divider />
                <CardContent sx={{ p: 3, pb: '0.75rem!important' }}>
                  {data.files.map((file, index) => (
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
                      {index + 1} <Translations text='DownloadFile' />
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
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

TopicView.acl = {
  action: 'read',
  subject: 'admin_topics'
}

export default TopicView
