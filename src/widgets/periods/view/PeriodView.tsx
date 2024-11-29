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

import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

// ** Custom Components Import
import Icon from 'src/shared/components/icon'

// ** Types
import { PeriodType } from 'src/entities/school/PeriodType'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { deletePeriod, getCurrentPeriod } from 'src/features/store/apps/periods'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { Box, CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import { useDialog } from 'src/app/context/DialogContext'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'

const PeriodView = () => {
  const router = useRouter()
  const id = router.query.periodId
  const { period_detail } = useSelector((state: RootState) => state.periods)
  const data: PeriodType = { ...(period_detail.data as PeriodType) }

  const showDialog = useDialog()
  const { t } = useTranslation()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentPeriod(id as string))
    }
  }, [dispatch, id])

  const handleShowDialog = async (id: string) => {
    const confirmed = await showDialog()
    if (confirmed && id) {
      handleDeletePeriod(id)
    }
  }

  const handleDeletePeriod = async (id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deletePeriod([id]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        router.push('/periods')
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  if (period_detail.error) {
    return <Error error={period_detail.error} />
  }

  if (!period_detail.loading && id) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('PeriodInformation')}
              action={
                ability.can('write', 'admin_periods') ? (
                  <Box display='flex' gap='15px'>
                    <Button
                      variant='tonal'
                      component={Link}
                      href={`/periods/edit/${data.id}`}
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
                  <Typography>{data.title}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='ClassroomsCount' />
                  </Typography>
                  <Typography>{data.data_counts?.classrooms_count}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='TimetablesCount' />
                  </Typography>
                  <Typography>{data.data_counts?.timetables_count}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='StudentsCount' />
                  </Typography>
                  <Typography>{data.data_counts?.students_count}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='TeachersCount' />
                  </Typography>
                  <Typography>{data.data_counts?.teachers_count}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='SubjectHours' />
                  </Typography>
                  <Typography>{data.data_counts?.subject_hours}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='GradesCount' />
                  </Typography>
                  <Typography>{data.data_counts?.grades_count}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='AbsentsCount' />
                  </Typography>
                  <Typography>{data.data_counts?.absents_count}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='School' />
                  </Typography>
                  <Typography>
                    {data.school?.parent && `${data.school.parent.name}, `}
                    {data.school?.name}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('QuarterInformation')} />
            <Divider />
            <CardContent sx={{ p: '0!important' }}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Translations text='QuarterName' />
                      </TableCell>
                      <TableCell>
                        <Translations text='QuarterStartDate' />
                      </TableCell>
                      <TableCell>
                        <Translations text='QuarterEndDate' />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.value?.map((quarter, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:last-of-type td, &:last-of-type th': {
                            border: 0
                          }
                        }}
                      >
                        <TableCell component='th' scope='row'>
                          {index + 1} <Translations text='Quarter' />
                        </TableCell>
                        {quarter.map((date, innerIndex) => (
                          <TableCell key={innerIndex}>{date}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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

export default PeriodView
