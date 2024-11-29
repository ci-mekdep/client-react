// ** React Imports
import { useState, useEffect, useContext } from 'react'

// ** Next Import
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { CircularProgress, Box } from '@mui/material'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Utils Imports
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'

// ** Types
import { ClassroomType } from 'src/entities/classroom/ClassroomType'

// ** Store
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { deleteClassroom, getCurrentClassroom } from 'src/features/store/apps/classrooms'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { convertClassroomSubgroupData } from 'src/features/utils/api/convertClassroomSubgroupData'
import { checkStudentsListNew } from 'src/features/utils/checkStudentsListNew'
import Error from 'src/widgets/general/Error'
import ClassroomSubjectCard from 'src/widgets/classrooms/view/ClassroomSubjectCard'
import ClassroomSubgroupsCard from 'src/widgets/classrooms/view/ClassroomSubgroupsCard'
import ClassroomStudentsCard from 'src/widgets/classrooms/view/ClassroomStudentsCard'
import { renderLangType } from 'src/features/utils/ui/renderLangType'
import { renderClassroomLevel } from 'src/features/utils/ui/renderClassroomLevel'
import { fetchSettings } from 'src/features/store/apps/settings'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { useDialog } from 'src/app/context/DialogContext'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { convertUserToLiteModel } from 'src/features/utils/api/convertUserToLiteModel'
import { UserListType } from 'src/entities/school/UserType'

const ClassroomView = () => {
  const [subgroups, setSubgroups] = useState<any>([])
  const [selectedLiteStudents, setSelectedLiteStudents] = useState<LiteModelType[] | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<UserListType[] | null>(null)
  const [data, setData] = useState<ClassroomType | null>(null)

  const router = useRouter()
  const { t } = useTranslation()
  const showDialog = useDialog()
  const id = router.query.classroomId
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { classroom_detail } = useSelector((state: RootState) => state.classrooms)

  useEffect(() => {
    dispatch(fetchSettings({}))
  }, [dispatch])

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentClassroom(id as string))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (
      id !== undefined &&
      !classroom_detail.loading &&
      classroom_detail.status === 'success' &&
      classroom_detail.data
    ) {
      const detailData: ClassroomType = { ...(classroom_detail.data as ClassroomType) }
      setSelectedLiteStudents(detailData.students ? detailData.students.map(item => convertUserToLiteModel(item)) : [])
      setSelectedStudents(detailData.students ? detailData.students : [])
      setSubgroups(convertClassroomSubgroupData(detailData))
      setData(checkStudentsListNew(detailData))
    }
  }, [classroom_detail, id])

  const handleShowDialog = async (id: string) => {
    const confirmed = await showDialog()
    if (confirmed && id) {
      handleDeleteClassroom(id)
    }
  }

  const handleDeleteClassroom = async (id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteClassroom([id]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        router.push('/classrooms')
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  if (classroom_detail.error) {
    return <Error error={classroom_detail.error} />
  }

  if (data && !classroom_detail.loading && id) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('ClassroomInformation')}
              action={
                ability?.can('write', 'admin_classrooms') ? (
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
                      href={`/classrooms/edit/${data.id}`}
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
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Name' />
                  </Typography>
                  <Typography>{data.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='ClassroomLangType' />
                  </Typography>
                  <Typography>{renderLangType(data.language)}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Level' />
                  </Typography>
                  <Typography>{renderClassroomLevel(data.level)}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='HeadTeacher' />
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
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='HeadStudent' />
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
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Period' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/periods/view/${data.period?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {data.period?.title}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='School' />
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
        <ClassroomStudentsCard
          id={id as string}
          data={data}
          selectedStudents={selectedLiteStudents}
          setSelectedStudents={setSelectedLiteStudents}
        />
        <ClassroomSubgroupsCard id={id as string} subgroups={subgroups} selectedStudents={selectedStudents} />
        <ClassroomSubjectCard id={id as string} data={data} />
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

export default ClassroomView
