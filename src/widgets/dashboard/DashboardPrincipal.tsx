// ** React Imports
import { forwardRef, useContext, useMemo, useState } from 'react'

// ** MUI Imports
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
  Alert,
  LinearProgress,
  Button
} from '@mui/material'

// ** Third Party Libs Imports
import Link from 'next/link'
import { format } from 'date-fns'
import DatePicker from 'react-datepicker'
import Icon from 'src/shared/components/icon'

// ** Custom Components Imports
import CustomChip from 'src/shared/components/mui/chip'
import CustomAvatar from 'src/shared/components/mui/avatar'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'

// ** Utils Imports
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'

// ** Type Imports
import { UserType } from 'src/entities/school/UserType'
import { renderRole } from 'src/features/utils/ui/renderRole'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'
import { calculatePercentage } from 'src/features/utils/calculatePercentage'
import { exportToExcel } from 'src/features/utils/exportToExcel'
import { useRouter } from 'next/router'
import { ParamsContext } from 'src/app/context/ParamsContext'
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { useAuth } from 'src/features/hooks/useAuth'
import DashboardPrincipalDetail from './details/DashboardPrincipalDetail'
import formatDistance from 'date-fns/formatDistance'
import { tmLocale } from 'src/app/configs/datePickerLocale'
import dataTableConfig from 'src/app/configs/dataTableConfig'

const renderStats = (dashboardData: any, setSearchParams: any, router: any) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Box
          data-cy='dashboard-stats-card'
          onClick={() => {
            setSearchParams('usersParams', { page: 0, roles: ['principal'] })
            router.push({
              pathname: '/users',
              query: { page: 0, roles: ['principal'] }
            })
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <CustomAvatar skin='light' color='warning' sx={{ mr: 4, width: 42, height: 42 }}>
            <Icon icon='tabler:user-star' fontSize='1.5rem' />
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h5'>{dashboardData?.principals_count}</Typography>
            <Typography variant='body2'>
              <Translations text='HeadsCount' />
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Box
          data-cy='dashboard-stats-card'
          onClick={() => {
            setSearchParams('usersParams', { page: 0, roles: ['teacher'] })
            router.push({
              pathname: '/users',
              query: { page: 0, roles: ['teacher'] }
            })
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <CustomAvatar skin='light' color='primary' sx={{ mr: 4, width: 42, height: 42 }}>
            <Icon icon='tabler:user-edit' fontSize='1.5rem' />
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h5'>{dashboardData?.teachers_count}</Typography>
            <Typography variant='body2'>
              <Translations text='TeachersCount' />
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Box
          data-cy='dashboard-stats-card'
          onClick={() => {
            setSearchParams('usersParams', { page: 0, roles: ['student'] })
            router.push({
              pathname: '/users',
              query: { page: 0, roles: ['student'] }
            })
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <CustomAvatar skin='light' color='success' sx={{ mr: 4, width: 42, height: 42 }}>
            <Icon icon='tabler:school' fontSize='1.5rem' />
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h5'>{dashboardData?.students_count}</Typography>
            <Typography variant='body2'>
              <Translations text='StudentsCount' />
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Box
          data-cy='dashboard-stats-card'
          onClick={() => {
            setSearchParams('classroomsParams', { page: 0 })
            router.push({
              pathname: '/classrooms',
              query: { page: 0 }
            })
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <CustomAvatar skin='light' color='error' sx={{ mr: 4, width: 42, height: 42 }}>
            <Icon icon='tabler:box-multiple' fontSize='1.5rem' />
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h5'>{dashboardData?.classrooms_count}</Typography>
            <Typography variant='body2'>
              <Translations text='ClassroomsCount' />
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Box
          data-cy='dashboard-stats-card'
          onClick={() => {
            setSearchParams('usersParams', { page: 0, roles: ['parent'] })
            router.push({
              pathname: '/users',
              query: { page: 0, roles: ['parent'] }
            })
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <CustomAvatar skin='light' color='info' sx={{ mr: 4, width: 42, height: 42 }}>
            <Icon icon='tabler:users-group' fontSize='1.5rem' />
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h5'>{dashboardData?.parents_count}</Typography>
            <Typography variant='body2'>
              <Translations text='ParentsCount' />
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}

interface Props {
  stats: any
  data: any
  loadingStats: boolean
  loadingData: boolean
  date: (string | null)[]
  handleDateParam: (start: string | null, end: string | null) => void
  setDate: (val: (string | null)[]) => void
}

interface PickerProps {
  label?: string
  end: Date | number | null
  start: Date | number | null
}

const CustomInput = forwardRef((props: PickerProps, ref) => {
  const startDate = props.start !== null ? format(props.start, 'dd.MM.yyyy') : ''
  const endDate = props.end !== null ? ` - ${props.end && format(props.end, 'dd.MM.yyyy')}` : null

  const value = `${startDate}${endDate !== null ? endDate : ''}`

  return <TextField size='small' fullWidth inputRef={ref} label={props.label || ''} {...props} value={value} />
})

const DashboardPrincipal = (props: Props) => {
  const [show, setShow] = useState<boolean>(false)
  const [selectedData, setSelectedData] = useState<any>(null)

  const loadingData = props.loadingData
  const dashboardStats = props.stats
  const dashboardData = props.data
  const date = props.date
  const handleDateParam = props.handleDateParam

  const router = useRouter()
  const { t } = useTranslation()
  const { current_role } = useAuth()
  const { setSearchParams } = useContext(ParamsContext)
  const { login } = useSelector((state: RootState) => state.login)
  const { report_forms_unfilled } = useSelector((state: RootState) => state.reportForms)

  const handleClose = () => {
    setShow(false)
    setSelectedData(null)
  }

  const convertDataByTeacherToExcel = () => {
    const transformedData = dashboardData.report_by_teacher.map((row: any) => {
      const obj: any = {}
      obj['Mugallym'] = renderUserFullname(row.teacher.last_name, row.teacher.first_name, row.teacher.middle_name)
      obj['Sagat sany'] = row.subject_percents.length
      obj['Doly'] = row.subject_percents.filter((x: any) => {
        return x.is_grade_full
      }).length
      obj['Doly däl'] = row.subject_percents.filter((x: any) => {
        return !x.is_grade_full
      }).length
      obj['Dolulyk'] =
        calculatePercentage(
          row.subject_percents.length,
          row.subject_percents.filter((x: any) => {
            return x.is_grade_full
          }).length
        ) + '%'

      return obj
    })

    const exportDate =
      date[0] && format(new Date(date[0]), 'dd.MM.yyyy') + date[1]
        ? ` - ${date[1] && format(new Date(date[1]), 'dd.MM.yyyy')}`
        : ''

    exportToExcel(`Žurnallaryň dolulygynyň hasabaty ${exportDate}.xlsx`, transformedData)
  }

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () =>
      current_role === 'principal'
        ? [
            {
              accessorKey: 'teacher',
              accessorFn: row => row.teacher.last_name,
              id: 'teacher',
              header: t('Teacher'),
              sortingFn: 'customSorting',
              Cell: ({ row }) => (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    component={Link}
                    href={`/users/view/${row.original.teacher.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: 600, textDecoration: 'none' }}
                  >
                    {renderUserFullname(
                      row.original.teacher.last_name,
                      row.original.teacher.first_name,
                      row.original.teacher.middle_name
                    )}
                  </Typography>
                </Box>
              )
            },
            {
              accessorKey: 'lesson_hours',
              accessorFn: row => row.subject_percents.length,
              id: 'lesson_hours',
              header: t('LessonHours'),
              Cell: ({ row }) => (
                <Typography sx={{ color: 'text.secondary' }}>{row.original.subject_percents.length}</Typography>
              )
            },
            {
              accessorKey: 'full',
              accessorFn: row =>
                row.subject_percents.filter((x: any) => {
                  return x.is_grade_full
                }).length,
              id: 'full',
              header: t('Full'),
              Cell: ({ row }) => (
                <>
                  {row.original.subject_percents.length > 0 ? (
                    <Typography color={'success.main'} fontWeight={600}>
                      {
                        row.original.subject_percents.filter((x: any) => {
                          return x.is_grade_full
                        }).length
                      }
                    </Typography>
                  ) : (
                    '-'
                  )}
                </>
              )
            },
            {
              accessorKey: 'not_full',
              accessorFn: row =>
                row.subject_percents.filter((x: any) => {
                  return !x.is_grade_full
                }).length,
              id: 'not_full',
              header: t('NotFull'),
              Cell: ({ row }) => (
                <>
                  {row.original.subject_percents.length > 0 ? (
                    <Typography color={'error.main'} fontWeight={600}>
                      {
                        row.original.subject_percents.filter((x: any) => {
                          return !x.is_grade_full
                        }).length
                      }
                    </Typography>
                  ) : (
                    '-'
                  )}
                </>
              )
            },
            {
              accessorKey: 'percent',
              accessorFn: row =>
                calculatePercentage(
                  row.subject_percents.length,
                  row.subject_percents.filter((x: any) => {
                    return x.is_grade_full
                  }).length
                ),
              id: 'percent',
              header: t('FullnessPercent'),
              Cell: ({ row }) => (
                <Box display={'flex'} justifyContent={'start'} alignItems={'center'}>
                  {row.original.subject_percents.length > 0 ? (
                    <>
                      <LinearProgress
                        color='primary'
                        value={calculatePercentage(
                          row.original.subject_percents.length,
                          row.original.subject_percents.filter((x: any) => {
                            return x.is_grade_full
                          }).length
                        )}
                        variant='determinate'
                        sx={{
                          height: 8,
                          width: 160,
                          borderRadius: 8
                        }}
                      />
                      <Typography ml={3}>{`${calculatePercentage(
                        row.original.subject_percents.length,
                        row.original.subject_percents.filter((x: any) => {
                          return x.is_grade_full
                        }).length
                      )}%`}</Typography>
                    </>
                  ) : (
                    '-'
                  )}
                </Box>
              )
            }
          ]
        : [],
    [current_role, t]
  )

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableSorting: true,
    enableRowActions: true,
    enableRowNumbers: true,
    enableStickyHeader: true,
    enableHiding: false,
    enableGrouping: false,
    enablePagination: false,
    enableStickyFooter: false,
    enableRowSelection: false,
    enableGlobalFilter: false,
    enableDensityToggle: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    renderTopToolbar: false,
    renderBottomToolbar: false,
    muiTableBodyCellProps: {
      padding: 'none'
    },
    muiTablePaperProps: { sx: { boxShadow: 'none!important' } },
    muiToolbarAlertBannerChipProps: { color: 'primary' },
    muiTableContainerProps: { sx: { maxHeight: 'none' } },
    muiTableProps: { id: 'dashboard-table' },
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box display='flex' alignItems='center' justifyContent='center'>
        <IconButton
          size='small'
          onClick={() => {
            setShow(true)
            setSelectedData(
              dashboardData.report_by_teacher.find((data: any) => {
                return data.teacher.id === row.original.teacher.id
              })
            )
          }}
          sx={{ color: 'text.secondary' }}
        >
          <Icon icon='tabler:eye' fontSize={20} />
        </IconButton>
      </Box>
    ),
    columns,
    data: dashboardData?.report_by_teacher ? dashboardData?.report_by_teacher : [],
    initialState: {
      density: 'compact'
    },
    state: { isLoading: loadingData }
  })

  return (
    <DatePickerWrapper>
      {selectedData && (
        <DashboardPrincipalDetail
          show={show}
          startDate={date[0] ? new Date(date[0]) : null}
          endDate={date[1] ? new Date(date[1]) : null}
          teacher={selectedData.teacher}
          subject_percents={selectedData.subject_percents}
          handleClose={handleClose}
        />
      )}
      {!login.loading && login.status === 'success' && login.data.last_session && (
        <Alert severity='warning' sx={{ mb: 3 }}>
          <Translations text='LastSessionAlert' />: {login.data.last_session.os}, IP: {login.data.last_session.ip} (
          {login.data.last_session.lat &&
            formatDistance(new Date(login.data.last_session.lat), new Date(), { addSuffix: true, locale: tmLocale })}
          ).
        </Alert>
      )}
      <Grid container spacing={6}>
        {!loadingData && dashboardData ? (
          <>
            <Grid item xs={12} md={8}>
              <Grid container spacing={6}>
                <Grid item xs={12} md={12}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title={t('Details')} />
                    <CardContent sx={{ pb: theme => `${theme.spacing(7.5)} !important` }}>
                      {renderStats(dashboardStats, setSearchParams, router)}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ position: 'relative', height: '100%' }}>
                    <CardHeader
                      title={t('NextLesson')}
                      action={
                        dashboardData.current_lesson_date &&
                        format(new Date(dashboardData.current_lesson_date), 'dd.MM.yyyy')
                      }
                    />
                    <CardContent>
                      <Grid container spacing={2} justifyContent={'space-between'}>
                        <Grid item>
                          <Typography variant='h5' fontWeight={600} mb={2}>
                            {dashboardData?.current_lesson_number}
                            <Translations text='NthLesson' />
                          </Typography>
                          <Typography variant='h6'>
                            {dashboardData?.current_lesson_subjects}
                            <Translations text='ClassessStudying' />
                          </Typography>
                        </Grid>
                        <Grid item>
                          <CustomChip
                            rounded
                            label={
                              dashboardData.current_lesson_times &&
                              dashboardData.current_lesson_times.map(
                                (time: string, index: number) =>
                                  `${time} ${dashboardData.current_lesson_times.length - 1 !== index ? ' - ' : ''}`
                              )
                            }
                            skin='light'
                            color='primary'
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      position: 'relative'
                    }}
                  >
                    <CardContent
                      component={Link}
                      href={'/tools/report-forms'}
                      sx={{
                        gap: 3,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textDecoration: 'none'
                      }}
                    >
                      {report_forms_unfilled.data.total_unfilled &&
                      Number(report_forms_unfilled.data.total_unfilled) > 0 ? (
                        <>
                          <Typography variant='h5'>
                            {report_forms_unfilled.data.total_unfilled + ' ' + t('NReportFormsUnfilled')}
                          </Typography>
                          <CustomAvatar skin='light' color='error' variant='rounded' sx={{ width: 48, height: 48 }}>
                            <Typography color='error' variant='h4'>
                              {report_forms_unfilled.data.total_unfilled}
                            </Typography>
                          </CustomAvatar>
                        </>
                      ) : (
                        <>
                          <Typography variant='h5'>
                            <Translations text='AllReportFormsFilled' />
                          </Typography>
                          <CustomAvatar skin='light' color='success' variant='rounded' sx={{ width: 48, height: 48 }}>
                            <Icon icon='tabler:circle-check' fontSize='2rem' />
                          </CustomAvatar>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%'
                }}
              >
                <CardHeader title={t('TodayBirthday')} />
                <CardContent sx={{ p: '0!important' }} data-cy='dashboard-birthday-card'>
                  {dashboardData.users_birthday && dashboardData.users_birthday.length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table data-cy='dashboard-birthday-table' size='small' stickyHeader aria-label='sticky table'>
                        <TableBody>
                          {dashboardData.users_birthday.map((user: UserType, index: number) => (
                            <TableRow key={index} hover>
                              <TableCell align='left'>
                                <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                  {renderUserFullname(user.last_name, user.first_name, null)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {user.classrooms && user.classrooms.length !== 0 && user.classrooms[0]?.name}
                              </TableCell>
                              <TableCell align='left'>{renderRole(user.role)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box mx={10} height={200} pt={20}>
                      <Typography textAlign='center'>
                        <Translations text='NoRows' />
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <Grid item xs={12} textAlign={'center'}>
            <CircularProgress
              sx={{
                width: '30px !important',
                height: '30px !important',
                m: theme => theme.spacing(2)
              }}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('JournalFullness')}
              action={
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: '30px' }}>
                  <DatePicker
                    locale='tm'
                    id='date'
                    selectsRange
                    autoComplete='off'
                    selected={date[0] ? new Date(date[0]) : null}
                    startDate={date[0] ? new Date(date[0]) : null}
                    endDate={date[1] ? new Date(date[1]) : null}
                    dateFormat='dd.MM.yyyy'
                    showYearDropdown
                    showMonthDropdown
                    placeholderText={t('SelectDate') as string}
                    customInput={
                      <CustomInput
                        label={t('Date') as string}
                        start={date[0] ? new Date(date[0]) : null}
                        end={date[1] ? new Date(date[1]) : null}
                      />
                    }
                    calendarStartDay={1}
                    shouldCloseOnSelect={false}
                    onChange={(dates: any) => {
                      const [start, end] = dates
                      props.setDate(dates.map((date: string | null) => date && format(new Date(date), 'yyyy-MM-dd')))
                      handleDateParam(start, end)
                    }}
                  />
                  <Button
                    color='success'
                    variant='contained'
                    sx={{ px: 8 }}
                    onClick={() => {
                      convertDataByTeacherToExcel()
                    }}
                    disabled={loadingData}
                    startIcon={<Icon icon='tabler:download' fontSize={20} />}
                  >
                    <Translations text='Export' />
                  </Button>
                </Box>
              }
            />
            {!loadingData && dashboardData ? (
              <MaterialReactTable table={table} />
            ) : (
              <Box display={'flex'} justifyContent={'center'}>
                <CircularProgress
                  sx={{
                    width: '30px !important',
                    height: '30px !important',
                    m: theme => theme.spacing(6)
                  }}
                />
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </DatePickerWrapper>
  )
}

export default DashboardPrincipal
