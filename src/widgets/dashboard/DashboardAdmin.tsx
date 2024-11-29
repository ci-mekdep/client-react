// ** React Imports
import { forwardRef, useContext, useEffect, useMemo, useState } from 'react'

// ** MUI Imports
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material'

// ** Third Party Libs Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'
import Icon from 'src/shared/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/shared/components/mui/avatar'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchDashboardsDataDetail } from 'src/features/store/apps/dashboards'
import { SchoolListType } from 'src/entities/school/SchoolType'
import { exportToExcel } from 'src/features/utils/exportToExcel'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ParamsContext } from 'src/app/context/ParamsContext'
import { useRouter } from 'next/router'
import { useAuth } from 'src/features/hooks/useAuth'
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import DashboardAdminDetail from './details/DashboardAdminDetail'
import formatDistance from 'date-fns/formatDistance'
import { tmLocale } from 'src/app/configs/datePickerLocale'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import DashboardPrincipalDetail from './details/DashboardPrincipalDetail'

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

const regionAllObj: SchoolListType = {
  id: '0',
  code: 'all',
  name: 'Ählisi',
  full_name: '',
  description: '',
  address: '',
  avatar: '',
  background: '',
  phone: '',
  email: '',
  level: null,
  archived_at: '',
  classrooms_count: 0,
  galleries: null,
  latitude: null,
  longitude: null,
  is_secondary_school: false,
  is_digitalized: false
}

const CustomInput = forwardRef((props: PickerProps, ref) => {
  const startDate = props.start !== null ? format(props.start, 'dd.MM.yyyy') : ''
  const endDate = props.end !== null ? ` - ${props.end && format(props.end, 'dd.MM.yyyy')}` : null
  const value = `${startDate}${endDate !== null ? endDate : ''}`

  return <TextField size='small' fullWidth inputRef={ref} label={props.label || ''} {...props} value={value} />
})

const renderStats = (dashboardData: any, setSearchParams: any, router: any) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <Box
          data-cy='dashboard-stats-card'
          onClick={() => {
            setSearchParams('usersParams', { page: 0, roles: ['organization'] })
            router.push({
              pathname: '/users',
              query: { page: 0, roles: ['organization'] }
            })
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <CustomAvatar skin='light' color='warning' sx={{ mr: 4, width: 42, height: 42 }}>
            <Icon icon='tabler:user-star' fontSize='1.5rem' />
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h5'>{dashboardData?.organizations_count}</Typography>
            <Typography variant='body2'>
              <Translations text='OrganizationsCount' />
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
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
      <Grid item xs={12} sm={6} md={4} lg={2}>
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
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <Box
          data-cy='dashboard-stats-card'
          onClick={() => {
            setSearchParams('schoolsParams', { page: 0 })
            router.push({
              pathname: '/schools',
              query: { page: 0 }
            })
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <CustomAvatar skin='light' color='error' sx={{ mr: 4, width: 42, height: 42 }}>
            <Icon icon='tabler:box-multiple' fontSize='1.5rem' />
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h5'>{dashboardData?.schools_count}</Typography>
            <Typography variant='body2'>
              <Translations text='SchoolsCount' />
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
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
      <Grid item xs={12} sm={6} md={4} lg={2}>
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
          <CustomAvatar skin='light' color='info' sx={{ mr: 4, width: 42, height: 42 }}>
            <Icon icon='tabler:users-group' fontSize='1.5rem' />
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h5'>{dashboardData?.principals_count}</Typography>
            <Typography variant='body2'>
              <Translations text='PrincipalsCount' />
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}

const DashboardAdmin = (props: Props) => {
  const [show, setShow] = useState<boolean>(false)
  const [showTeacherDetail, setShowTeacherDetail] = useState<boolean>(false)
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [school, setSchool] = useState<SchoolListType | null>(null)
  const [tableData, setTableData] = useState<any>(null)
  const [filteredTableData, setFilteredTableData] = useState<any>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>('Ählisi')
  const [regions, setRegions] = useState<SchoolListType[] | null>(null)
  const [inputValueRegions, setInputValueRegions] = useState<string[] | null>(null)
  const [selectedData, setSelectedData] = useState<any>(null)

  const loadingStats = props.loadingStats
  const loadingData = props.loadingData
  const dashboardStats = props.stats
  const dashboardData = props.data
  const date = props.date
  const handleDateParam = props.handleDateParam

  const router = useRouter()
  const { t } = useTranslation()
  const { current_role } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const { setSearchParams } = useContext(ParamsContext)
  const { login } = useSelector((state: RootState) => state.login)

  const handleClose = () => {
    setShow(false)
    setSchool(null)
  }

  const handleCloseTeacherDetail = () => {
    setShowTeacherDetail(false)
    setSelectedData(null)
  }

  const handleSelectTeacher = (val: any) => {
    setSelectedData(val)
  }

  useEffect(() => {
    if (school !== null) {
      const params: any = { date: [] }
      params.school_id = school.id
      if (props.date[0] !== null) {
        params.start_date = props.date[0]
      }
      if (props.date[1] !== null) {
        params.end_date = props.date[1]
      }
      dispatch(fetchDashboardsDataDetail(params))
    }
  }, [dispatch, school, props.date, current_role])

  useEffect(() => {
    if (dashboardData?.report_by_school) {
      const parents = dashboardData?.report_by_school?.map((item: any) => item.school?.parent)
      const uniqueParents: SchoolListType[] = Array.from(
        new Map(parents.map((parent: any) => [parent.id, parent])).values()
      ) as SchoolListType[]
      uniqueParents.unshift(regionAllObj)
      setRegions(uniqueParents as SchoolListType[])
      setInputValueRegions(uniqueParents.map(item => item.name))

      const data = dashboardData?.report_by_school
      setTableData(data)
      setFilteredTableData(data)
    }
  }, [dashboardData?.report_by_school])

  const handleChangeRegion = (e: SelectChangeEvent<string>) => {
    e?.preventDefault()
    const thisItem = regions?.find(item => item.name === e.target.value)
    thisItem && setSelectedRegion(thisItem.name)

    if (e.target.value === 'Ählisi') {
      setFilteredTableData(tableData)
    } else {
      const filteredData = tableData.filter((item: any) => item.school.parent.name === e.target.value)
      setFilteredTableData(filteredData)
    }
  }

  const convertDataBySchoolToExcel = () => {
    const transformedData = dashboardData.report_by_school.map((row: any) => {
      const obj: any = {}
      obj['Mekdep'] = row.school.name
      obj['Okuwçy sany'] = row.subject_percent?.students_count
      obj['Geçilen sapaklar'] =
        row.subject_percent?.lessons_count && row.subject_percent?.topics_count
          ? row.subject_percent?.lessons_count + ' / ' + row.subject_percent?.topics_count
          : ''
      obj['Žurnallaryň dolulygy'] = row.subject_percent?.grade_full_percent

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
      current_role === 'admin' || current_role === 'organization'
        ? [
            {
              accessorKey: 'school',
              accessorFn: row => row.school?.name,
              id: 'school',
              header: t('Mekdep'),
              Cell: ({ row }) => (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography>{row.original.school.name}</Typography>
                  <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                    {row.original.school.parent?.name}
                  </Typography>
                </Box>
              )
            },
            {
              accessorKey: 'students_count',
              accessorFn: row => row.subject_percent && row.subject_percent.students_count,
              id: 'students_count',
              header: t('StudentsCount'),
              Cell: ({ row }) => (
                <Typography>{row.original.subject_percent && row.original.subject_percent.students_count}</Typography>
              )
            },
            {
              accessorKey: 'lessons',
              accessorFn: row => row.subject_percent && row.subject_percent.lessons_count,
              id: 'lessons',
              header: t('PastLessons'),
              Cell: ({ row }) => (
                <Typography>
                  {row.original.subject_percent
                    ? row.original.subject_percent.lessons_count + ' / ' + row.original.subject_percent.topics_count
                    : null}
                </Typography>
              )
            },
            {
              accessorKey: 'grade_full_percent',
              accessorFn: row => row.subject_percent && row.subject_percent.grade_full_percent,
              id: 'percent',
              header: t('JournalFullness'),
              Cell: ({ row }) => (
                <>
                  {row.original.subject_percent && (
                    <Box display={'flex'} justifyContent='start' alignItems={'center'}>
                      <LinearProgress
                        color='primary'
                        value={row.original.subject_percent.grade_full_percent}
                        variant='determinate'
                        sx={{
                          height: 8,
                          width: 160,
                          borderRadius: 8
                        }}
                      />
                      <Typography
                        ml={3}
                        sx={{ color: row.original.subject_percent.is_grade_full ? 'success.main' : 'error.main' }}
                      >{`${row.original.subject_percent.grade_full_percent}%`}</Typography>
                    </Box>
                  )}
                </>
              )
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
      <Box display='flex' alignItems='center' justifyContent='center'>
        <IconButton
          size='small'
          onClick={() => {
            setShow(true)
            setSchool(row.original.school)
          }}
          sx={{ color: 'text.secondary' }}
        >
          <Icon icon='tabler:eye' fontSize={20} />
        </IconButton>
      </Box>
    ),
    columns,
    data: filteredTableData ? filteredTableData : [],
    initialState: {
      density: 'compact',
      expanded: true
    },
    state: { isLoading: loadingData }
  })

  return (
    <DatePickerWrapper>
      <DashboardAdminDetail
        show={show}
        startDate={date[0] ? new Date(date[0]) : null}
        endDate={date[1] ? new Date(date[1]) : null}
        school={school}
        setShowTeacherDetail={setShowTeacherDetail}
        handleClose={handleClose}
        handleSelectTeacher={handleSelectTeacher}
      />
      {selectedData && (
        <DashboardPrincipalDetail
          show={showTeacherDetail}
          startDate={date[0] ? new Date(date[0]) : null}
          endDate={date[1] ? new Date(date[1]) : null}
          teacher={selectedData.teacher}
          subject_percents={selectedData.subject_percents}
          handleClose={handleCloseTeacherDetail}
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
        {!loadingStats && dashboardStats ? (
          <Grid item xs={12}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title={t('Details')} />
              <CardContent sx={{ pb: theme => `${theme.spacing(7.5)} !important` }}>
                {renderStats(dashboardStats, setSearchParams, router)}
              </CardContent>
            </Card>
          </Grid>
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
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 5 }}>
                  <DatePicker
                    id='date'
                    locale='tm'
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
                  <FormControl fullWidth size='small'>
                    <InputLabel id='region-filter-label'>
                      <Translations text='Region' />
                    </InputLabel>
                    <Select
                      label={t('Region')}
                      value={selectedRegion}
                      onChange={handleChangeRegion}
                      id='region-filter'
                      labelId='region-filter-label'
                      sx={{ minWidth: 100 }}
                    >
                      {inputValueRegions &&
                        inputValueRegions.map((region: string, index: number) => (
                          <MenuItem key={index} value={region}>
                            {region}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <Button
                    color='success'
                    variant='contained'
                    sx={{ px: 8, minWidth: 120 }}
                    onClick={() => {
                      convertDataBySchoolToExcel()
                    }}
                    disabled={loadingData}
                    startIcon={<Icon icon='tabler:download' fontSize={20} />}
                  >
                    <Translations text='Export' />
                  </Button>
                  <Button
                    color='primary'
                    variant='tonal'
                    sx={{ px: 10, minWidth: 130 }}
                    onClick={() => {
                      setCollapsed(!collapsed)
                    }}
                    endIcon={<Icon icon={!collapsed ? 'tabler:chevron-down' : 'tabler:chevron-up'} fontSize={20} />}
                  >
                    <Translations text='Detail' />
                  </Button>
                </Box>
              }
            />
            <Collapse in={collapsed}>
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
            </Collapse>
          </Card>
        </Grid>
      </Grid>
    </DatePickerWrapper>
  )
}

export default DashboardAdmin
