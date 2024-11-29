// ** React Imports
import { useEffect, useContext, useState } from 'react'

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
import { SubjectExamType, SubjectType } from 'src/entities/classroom/SubjectType'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { deleteSubject, getCurrentSubject } from 'src/features/store/apps/subjects'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { renderSubgroup } from 'src/features/utils/ui/renderSubgroup'
import { Box, CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { useDialog } from 'src/app/context/DialogContext'
import { deleteSubjectExam, getCurrentSubjectExam } from 'src/features/store/apps/subjectExams'
import format from 'date-fns/format'

const SubjectView = () => {
  const [subjectExam, setSubjectExam] = useState<SubjectExamType | null>(null)
  const router = useRouter()
  const id = router.query.subjectId
  const { subject_detail } = useSelector((state: RootState) => state.subjects)
  const { subject_exam_detail } = useSelector((state: RootState) => state.subjectExams)
  const data: SubjectType = { ...(subject_detail.data as SubjectType) }

  const showDialog = useDialog()
  const { t } = useTranslation()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentSubject(id as string))
      dispatch(getCurrentSubjectExam({ subject_id: id as string }))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (!subject_exam_detail.loading && subject_exam_detail.status === 'success' && subject_exam_detail.data) {
      if (subject_exam_detail.data.length === 0) {
        setSubjectExam(null)
      } else {
        setSubjectExam(subject_exam_detail.data[0])
      }
    }
  }, [subject_exam_detail])

  const handleShowDialog = async (id: string) => {
    const confirmed = await showDialog()
    if (confirmed && id) {
      handleDeleteSubject(id)
    }
  }

  const handleShowExamDialog = async (id: string) => {
    const confirmed = await showDialog()
    if (confirmed && id) {
      handleDeleteSubjectExam(id)
    }
  }

  const handleDeleteSubject = async (id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteSubject([id]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        router.push('/subjects')
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const handleDeleteSubjectExam = async (exam_id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteSubjectExam([exam_id]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        dispatch(getCurrentSubject(id as string))
        dispatch(getCurrentSubjectExam({ subject_id: id as string }))
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  if (subject_detail.error) {
    return <Error error={subject_detail.error} />
  }

  if (subject_exam_detail.error) {
    return <Error error={subject_exam_detail.error} />
  }

  if (!subject_detail.loading && !subject_exam_detail.loading && id) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('SubjectInformation')}
              action={
                ability.can('write', 'admin_subjects') ? (
                  <Box display='flex' gap='15px'>
                    <Button
                      variant='tonal'
                      color='secondary'
                      startIcon={<Icon icon='tabler:history' fontSize={20} />}
                      onClick={() => {
                        const currentParams = new URLSearchParams(window.location.search)

                        currentParams.set('page', '0')
                        currentParams.set('type', 'id')
                        currentParams.set('search', data.id)
                        currentParams.set('school_id', data.school?.id || '')

                        router.push(
                          {
                            pathname: '/settings/user-logs',
                            search: `?${currentParams.toString()}`
                          },
                          undefined,
                          { shallow: true }
                        )
                      }}
                    >
                      <Translations text='Logs' />
                    </Button>
                    <Button
                      variant='tonal'
                      component={Link}
                      href={`/subjects/edit/${data.id}`}
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
                  <Typography>{data.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Classroom' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/classrooms/view/${data.classroom?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {data.classroom?.name}
                  </Typography>
                </Grid>
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
                    <Translations text='SecondTeacher' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/users/view/${data.second_teacher?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {renderUserFullname(
                      data.second_teacher?.last_name,
                      data.second_teacher?.first_name,
                      data.second_teacher?.middle_name
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='LessonHours' />
                  </Typography>
                  <Typography>{data.week_hours}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='School' />
                  </Typography>
                  <Typography>
                    {data.school?.parent && `${data.school.parent.name}, `}
                    {data.school?.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Subgroup' />
                  </Typography>
                  {data.classroom_type !== null && data.classroom_type_key !== null ? (
                    data.classroom?.sub_groups?.some(obj => obj.type === data.classroom_type) ? (
                      <Typography>{renderSubgroup(data.classroom_type) + ' - ' + data.classroom_type_key}</Typography>
                    ) : null
                  ) : (
                    <Typography>
                      <Translations text='FullClassroom' />
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={8}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='RelatedSubjects' />
                  </Typography>
                  <Box display='flex' flexDirection='column'>
                    {data.parent && (
                      <Typography
                        component={Link}
                        href={`/subjects/view/${data.parent.id}`}
                        color={'primary.main'}
                        sx={{ fontWeight: '600', textDecoration: 'none' }}
                      >
                        {data.parent.full_name} ({data.parent.classroom_type_key && data.parent.classroom_type_key})
                      </Typography>
                    )}
                    {data.children &&
                      data.children.map((child, index) => (
                        <Typography
                          key={child.id}
                          component={Link}
                          href={`/subjects/view/${child.id}`}
                          sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                        >
                          {child.full_name} ({child.classroom_type_key && child.classroom_type_key}){' '}
                          {data.children.length - 1 !== index && ', '}
                        </Typography>
                      ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          {subjectExam !== null && subject_exam_detail.status === 'success' ? (
            <Card>
              <CardHeader
                title={t('SubjectExamInformation')}
                action={
                  ability.can('write', 'admin_subjects_exams') ? (
                    <Box display='flex' gap='15px'>
                      <Button
                        variant='tonal'
                        component={Link}
                        href={`/subjects/view/${data.id}/exam/edit/${subjectExam.id}`}
                        startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                      >
                        <Translations text='Edit' />
                      </Button>
                      <Button
                        color='error'
                        variant='tonal'
                        onClick={() => {
                          handleShowExamDialog(subjectExam.id)
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
                      <Translations text='ExamTeacher' />
                    </Typography>
                    <Typography
                      component={Link}
                      href={`/users/view/${subjectExam.teacher?.id}`}
                      color={'primary.main'}
                      sx={{ fontWeight: '600', textDecoration: 'none' }}
                    >
                      {renderUserFullname(
                        subjectExam.teacher?.last_name,
                        subjectExam.teacher?.first_name,
                        subjectExam.teacher?.middle_name
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='ExamHeadTeacher' />
                    </Typography>
                    <Typography
                      component={Link}
                      href={`/users/view/${subjectExam.head_teacher?.id}`}
                      color={'primary.main'}
                      sx={{ fontWeight: '600', textDecoration: 'none' }}
                    >
                      {renderUserFullname(
                        subjectExam.head_teacher?.last_name,
                        subjectExam.head_teacher?.first_name,
                        subjectExam.head_teacher?.middle_name
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='ExamMembers' />
                    </Typography>
                    <Box display='flex' flexDirection='column'>
                      {subjectExam.member_teachers.map(member => (
                        <Typography
                          key={member.id}
                          component={Link}
                          href={`/users/view/${member.id}`}
                          sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                        >
                          {renderUserFullname(member.last_name, member.first_name, member.middle_name)}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='StartTime' />
                    </Typography>
                    <Typography>
                      {subjectExam.start_time && format(new Date(subjectExam.start_time), 'dd.MM.yyyy HH:mm')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='Duration' />
                    </Typography>
                    {subjectExam.time_length_min && (
                      <Typography>
                        {subjectExam.time_length_min} {t('Minute')}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='CabinetNumber' />
                    </Typography>
                    <Typography>{subjectExam.room_number}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader
                title={t('SubjectExamInformation')}
                action={
                  ability.can('write', 'admin_subjects_exams') ? (
                    <Button
                      variant='tonal'
                      component={Link}
                      href={`/subjects/view/${data.id}/exam/create`}
                      startIcon={<Icon icon='tabler:plus' fontSize={20} />}
                    >
                      <Translations text='Add' />
                    </Button>
                  ) : null
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={5}>
                  <Grid item xs={12}>
                    <Typography margin={5} textAlign='center'>
                      <Translations text='NoSubjectExam' />
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
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

SubjectView.acl = {
  action: 'read',
  subject: 'admin_subjects'
}

export default SubjectView
