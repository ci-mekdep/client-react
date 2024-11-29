// ** React Imports
import { forwardRef, useContext, useMemo } from 'react'

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
  Typography,
  Alert,
  TextField,
  Tooltip
} from '@mui/material'

// ** Third Party Libs Imports
import { format } from 'date-fns'
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
import { useRouter } from 'next/router'
import { ParamsContext } from 'src/app/context/ParamsContext'
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { useAuth } from 'src/features/hooks/useAuth'
import formatDistance from 'date-fns/formatDistance'
import { tmLocale } from 'src/app/configs/datePickerLocale'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import DatePicker from 'react-datepicker'
import Link from 'next/link'

const renderStats = (dashboardData: any, setSearchParams: any, router: any) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={6} md={4} lg={3}>
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
          <CustomAvatar skin='light' color='warning' sx={{ mr: 4, width: 42, height: 42 }}>
            <Icon icon='tabler:user-star' fontSize='1.5rem' />
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h5'>{dashboardData?.teacher_classroom_name}</Typography>
            <Typography variant='body2'>
              <Translations text='TeacherClassroom' />
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
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
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Box
          data-cy='dashboard-stats-card'
          onClick={() => {
            setSearchParams('subjectsParams', { page: 0 })
            router.push({
              pathname: '/subjects',
              query: { page: 0 }
            })
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <CustomAvatar skin='light' color='primary' sx={{ mr: 4, width: 42, height: 42 }}>
            <Icon icon='tabler:user-edit' fontSize='1.5rem' />
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h5'>{dashboardData?.subject_hours_sum}</Typography>
            <Typography variant='body2'>
              <Translations text='LessonHours' />
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
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

const DashboardTeacher = (props: Props) => {
  const loadingData = props.loadingData
  const dashboardStats = props.stats
  const dashboardData = props.data
  const date = props.date
  const handleDateParam = props.handleDateParam

  const router = useRouter()
  const { t } = useTranslation()
  const { user, current_role } = useAuth()
  const { setSearchParams } = useContext(ParamsContext)
  const { login } = useSelector((state: RootState) => state.login)
  const { report_forms_unfilled } = useSelector((state: RootState) => state.reportForms)

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () =>
      current_role === 'teacher'
        ? [
            {
              accessorKey: 'subject',
              accessorFn: row => row.classroom_name,
              id: 'subject',
              header: t('SubjectName'),
              sortingFn: 'customSorting',
              Cell: ({ row }) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {row.original.classroom_name + ' - ' + row.original.subject_name}
                  </Typography>
                  <Typography variant='body2' textAlign='start'>
                    {row.original.lesson_date && format(new Date(row.original.lesson_date), 'dd.MM.yyyy')}
                  </Typography>
                </Box>
              )
            },
            {
              accessorKey: 'lesson_title',
              accessorFn: row => row.lesson_title,
              id: 'lesson_title',
              header: t('LessonTitle'),
              Cell: ({ row }) => (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  {row.original.assignment_title !== null && row.original.assignment_title !== '' ? (
                    <CustomAvatar
                      skin='light'
                      color='success'
                      variant='circular'
                      sx={{ height: '25px', width: '25px' }}
                    >
                      <Icon icon='tabler:home-edit' fontSize={16} />
                    </CustomAvatar>
                  ) : (
                    <CustomAvatar skin='light' color='error' variant='circular' sx={{ height: '25px', width: '25px' }}>
                      <Icon icon='tabler:home-edit' fontSize={16} />
                    </CustomAvatar>
                  )}
                  <Typography sx={{ color: 'text.secondary', wordWrap: 'inherit' }}>
                    {row.original.lesson_title}
                  </Typography>
                </Box>
              )
            },
            {
              accessorKey: 'grade_full_percent',
              accessorFn: row => row.grade_full_percent,
              id: 'grade_full_percent',
              header: t('FullnessPercent'),
              Cell: ({ row }) => (
                <Typography sx={{ color: row.original.is_grade_full ? 'success.main' : 'error.main' }}>
                  {row.original.grade_full_percent}
                </Typography>
              )
            },
            {
              accessorKey: 'absent_percent',
              accessorFn: row => row.absent_percent,
              id: 'absent_percent',
              header: t('AbsentPercent'),
              Cell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.original.absent_percent}</Typography>
            },
            {
              accessorKey: 'students_count',
              accessorFn: row => row.students_count,
              id: 'students_count',
              header: t('StudentsCount'),
              Cell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.original.students_count}</Typography>
            }
          ]
        : [],
    [current_role, t]
  )

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableSorting: true,
    enableGrouping: true,
    enableRowActions: true,
    enableRowNumbers: true,
    enableStickyHeader: true,
    enableHiding: false,
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
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around'
        }}
      >
        <Tooltip title={t('ViewJournal')}>
          <IconButton
            size='small'
            target='_blank'
            href={`https://mekdep.edu.tm/mobile/#/JournalPage?date=${
              row.original.lesson_date && format(new Date(row.original.lesson_date), 'yyyy-MM-dd')
            }&teacher_id=${user?.id}&subject_id=${row.original.subject_id}`}
            sx={{ color: 'text.secondary' }}
          >
            <Icon icon='tabler:book' />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    columns,
    data: dashboardData?.report_by_teacher ? dashboardData?.report_by_teacher[0]?.subject_percents : [],
    initialState: {
      density: 'compact'
    },
    state: { isLoading: loadingData }
  })

  return (
    <DatePickerWrapper>
      {!login.loading && login.status === 'success' && login.data.last_session && (
        <Alert severity='warning' sx={{ mb: 3 }}>
          <Translations text='LastSessionAlert' />: {login.data.last_session.os}, IP: {login.data.last_session.ip} (
          {login.data.last_session.lat &&
            formatDistance(new Date(login.data.last_session.lat), new Date(), { addSuffix: true, locale: tmLocale })}
          ).
        </Alert>
      )}
      <Grid container spacing={6}>
        {!loadingData && !report_forms_unfilled.loading && dashboardData ? (
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

export default DashboardTeacher
