// ** React Imports
import { useEffect, useContext } from 'react'

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

// ** Types

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { Box, CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { useDialog } from 'src/app/context/DialogContext'
import { deleteTeacherExcuse, getCurrentTeacherExcuse } from 'src/features/store/apps/teacherExcuses'
import { TeacherExcuseType } from 'src/entities/school/TeacherExcuseType'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import format from 'date-fns/format'
import { renderTeacherExcuseReason } from 'src/features/utils/ui/renderTeacherExcuseReason'

const TeacherExcuseView = () => {
  const router = useRouter()
  const id = router.query.teacherExcuseId
  const { teacher_excuse_detail } = useSelector((state: RootState) => state.teacherExcuses)
  const data: TeacherExcuseType = { ...(teacher_excuse_detail.data as TeacherExcuseType) }

  const showDialog = useDialog()
  const { t } = useTranslation()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentTeacherExcuse(id as string))
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
      handleDeleteTeacherExcuse(id)
    }
  }

  const handleDeleteTeacherExcuse = async (id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteTeacherExcuse([id]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        router.push('/teacher-excuses')
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  if (teacher_excuse_detail.error) {
    return <Error error={teacher_excuse_detail.error} />
  }

  if (!teacher_excuse_detail.loading && id) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('TeacherExcuseInformation')}
              action={
                ability.can('write', 'admin_teacher_excuses') ? (
                  <Box display='flex' gap='15px'>
                    <Button
                      variant='tonal'
                      component={Link}
                      href={`/teacher-excuses/edit/${data.id}`}
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
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Teacher' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/users/view/${data.teacher?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {renderUserFullname(data.teacher?.last_name, data.teacher?.first_name, data.teacher?.middle_name)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='School' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/schools/view/${data.school?.id || ''}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {data.school?.parent && `${data.school.parent.name}, `}
                    {data.school?.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Reason' />
                  </Typography>
                  <Typography>{renderTeacherExcuseReason(data.reason)}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='ExcuseStartDate' />
                  </Typography>
                  <Typography>{data.start_date && format(new Date(data.start_date), 'dd.MM.yyyy')}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='ExcuseEndDate' />
                  </Typography>
                  <Typography>{data.end_date && format(new Date(data.end_date), 'dd.MM.yyyy')}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Note' />
                  </Typography>
                  <Typography>{data.note}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        {data.document_files && data.document_files.length !== 0 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title={t('Files')} />
              <Divider />
              <CardContent sx={{ p: 3, pb: '0.75rem!important' }}>
                {data.document_files.map((file, index) => (
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
          </Grid>
        )}
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

TeacherExcuseView.acl = {
  action: 'read',
  subject: 'admin_teacher_excuses'
}

export default TeacherExcuseView
