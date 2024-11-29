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
import { deleteBaseSubject, getCurrentBaseSubject } from 'src/features/store/apps/baseSubjects'
import { BaseSubjectType } from 'src/entities/classroom/BaseSubjectType'
import { renderAgeCategory } from 'src/features/utils/ui/renderAgeCategory'
import { renderPrice } from 'src/features/utils/ui/renderPrice'
import CustomChip from 'src/shared/components/mui/chip'

const BaseSubjectView = () => {
  const router = useRouter()
  const id = router.query.baseSubjectId
  const { base_subject_detail } = useSelector((state: RootState) => state.baseSubjects)
  const data: BaseSubjectType = { ...(base_subject_detail.data as BaseSubjectType) }

  const showDialog = useDialog()
  const { t } = useTranslation()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentBaseSubject(id as string))
    }
  }, [dispatch, id])

  const handleShowDialog = async (id: string) => {
    const confirmed = await showDialog()
    if (confirmed && id) {
      handleDeleteBaseSubject(id)
    }
  }

  const handleDeleteBaseSubject = async (id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteBaseSubject([id]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        router.push('/base-subjects')
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  if (base_subject_detail.error) {
    return <Error error={base_subject_detail.error} />
  }

  if (!base_subject_detail.loading && id) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('CourseInformation')}
              action={
                ability.can('write', 'admin_subjects') ? (
                  <Box display='flex' gap='15px'>
                    <Button
                      variant='tonal'
                      component={Link}
                      href={`/base-subjects/edit/${data.id}`}
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
                    <Translations text='Name' />
                  </Typography>
                  <Box display='flex' gap={3}>
                    <Typography>{data.name}</Typography>
                    <CustomChip
                      rounded
                      size='small'
                      skin='light'
                      label={data.is_available ? t('Available') : t('NotAvailable')}
                      color={data.is_available ? 'success' : 'error'}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Category' />
                  </Typography>
                  <Typography>{data.category}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='AgeCategory' />
                  </Typography>
                  <Typography>{renderAgeCategory(data.age_category)}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='ExamMinGrade' />
                  </Typography>
                  <Typography>{data.exam_min_grade}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Price' />
                  </Typography>
                  <Typography>{renderPrice(data.price)}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='EduCenter' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/schools/view/${data.school?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {data.school?.parent && `${data.school.parent.name}, `}
                    {data.school?.name}
                  </Typography>
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

BaseSubjectView.acl = {
  action: 'read',
  subject: 'admin_subjects'
}

export default BaseSubjectView
