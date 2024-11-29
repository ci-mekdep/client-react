// ** React Imports
import { useState, useEffect, useContext } from 'react'

// ** Next Import
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Import
import Icon from 'src/shared/components/icon'

// ** Third party libraries
import format from 'date-fns/format'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'

// ** Types
import subjectColors from 'src/app/configs/subjectColors'
import { TimetableType } from 'src/entities/classroom/TimetableType'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchSubjects } from 'src/features/store/apps/subjects'
import { deleteTimetable, getCurrentTimetable } from 'src/features/store/apps/timetables'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { resetWeekHoursSubjects } from 'src/features/utils/resetWeekHoursSubjects'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { SubjectListType } from 'src/entities/classroom/SubjectType'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { useDialog } from 'src/app/context/DialogContext'
import { useSettings } from 'src/shared/hooks/useSettings'

function renderEventContent(eventInfo: any) {
  return (
    <Box
      sx={{
        margin: 0.1,
        padding: 1.5,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 0.5,
        position: 'absolute',
        background: eventInfo.event.extendedProps.bg + '!important'
      }}
    >
      <Typography variant='body2' fontWeight={700}>
        {eventInfo.event.title}
      </Typography>
      <Typography variant='caption'>
        {eventInfo.event.extendedProps.second_teacher
          ? eventInfo.event.extendedProps.second_teacher
          : eventInfo.event.extendedProps.teacher}
        {eventInfo.event.extendedProps.child_teacher ? ' • ' + eventInfo.event.extendedProps.child_teacher : null}
      </Typography>
    </Box>
  )
}

const TimetableView = () => {
  const [events, setEvents] = useState<any>([])
  const [calendarData, setCalendarData] = useState({
    startDate: '1970-01-12',
    startTime: '01:00',
    eventsPerDay: 7
  })

  const { subjects_list } = useSelector((state: RootState) => state.subjects)
  const { timetable_detail } = useSelector((state: RootState) => state.timetables)
  const data: TimetableType = { ...(timetable_detail.data as TimetableType) }

  const router = useRouter()
  const showDialog = useDialog()
  const { t } = useTranslation()
  const { settings } = useSettings()
  const id = router.query.timetableId
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (id !== undefined && timetable_detail.data.id !== (id as string)) {
      dispatch(getCurrentTimetable(id as string))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id])

  useEffect(() => {
    if (
      id !== undefined &&
      !timetable_detail.loading &&
      timetable_detail.status === 'success' &&
      timetable_detail.data &&
      timetable_detail.data.id === (id as string)
    ) {
      setCalendarData(prev => ({ ...prev, eventsPerDay: timetable_detail.data?.shift.value[0].length }))
      if (timetable_detail.data.classroom?.id) {
        dispatch(
          fetchSubjects({
            limit: 200,
            offset: 0,
            classroom_ids: [timetable_detail.data.classroom.id]
          })
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timetable_detail, dispatch, id])

  useEffect(() => {
    if (
      id !== undefined &&
      !timetable_detail.loading &&
      timetable_detail.status === 'success' &&
      timetable_detail.data &&
      timetable_detail.data.id == (id as string) &&
      !subjects_list.loading &&
      subjects_list.status === 'success'
    ) {
      setEvents(
        generateEvents(
          timetable_detail.data.value,
          resetWeekHoursSubjects(timetable_detail.data.value, subjects_list.data, timetable_detail.data.shift.value),
          settings.mode
        )
      )
    }
  }, [timetable_detail, id, subjects_list, settings])

  const zeroPad = (num: any, places: any) => String(num).padStart(places, '0')
  const timeToString = function (time: any) {
    const hour = Math.floor(time / 60)
    const minutes = time % 60

    return zeroPad(hour, 2) + ':' + zeroPad(minutes, 2)
  }
  const stringToTime = function (str: any) {
    str = str.split(':')

    return parseInt(str[0]) * 60 + parseInt(str[1])
  }
  const dateToUnixTime = function (date: any) {
    if (typeof date === 'string') date = new Date(date)

    return Math.floor(date.getTime() / 1000)
  }
  const unixTimeToDate = function (unixTime: any) {
    const date = new Date(unixTime * 1000)
    date.setHours(date.getHours() - new Date(0).getHours())

    return date
  }
  const DAY_NAMES = [t('Sunday'), t('Monday'), t('Tuesday'), t('Wednesday'), t('Thursday'), t('Friday'), t('Saturday')]
  const eventDurationMinutes = stringToTime('02:00') - stringToTime('01:00')
  const eventDuration = timeToString(eventDurationMinutes)
  const startTimeMinutes = stringToTime(calendarData.startTime)
  const endTime = timeToString(startTimeMinutes + calendarData.eventsPerDay * eventDurationMinutes)
  const endDate = unixTimeToDate(dateToUnixTime(calendarData.startDate) + 6 * 24 * 3600).toLocaleDateString()

  const generateEvents = (subject_ids: string[][], subjects: SubjectListType[], mode: string) => {
    const events: any[] = []
    for (let i = 0; i < subject_ids.length; i++) {
      for (let j = 0; j < subject_ids[i].length; j++) {
        if (subject_ids[i][j] !== null) {
          const thisSubject = subjects?.find((subject: SubjectListType) => subject.id === subject_ids[i][j])
          if (thisSubject !== undefined) {
            const newEvent: any = {
              id: null,
              title: null,
              start: null,
              end: null,
              teacher: null,
              second_teacher: null
            }
            newEvent.id = (i + j + Math.floor(Math.random() * 10000)).toString()
            newEvent.subject_id = subject_ids[i][j]
            newEvent.start = new Date(1970, 0, i + 1 + 11, j + 1)
            newEvent.end = new Date(1970, 0, i + 1 + 11, j + 2)
            newEvent.child_teacher = renderUserFullname(
              thisSubject?.child_teacher?.last_name,
              thisSubject?.child_teacher?.first_name,
              null
            )
            newEvent.teacher = renderUserFullname(
              thisSubject?.teacher?.last_name,
              thisSubject?.teacher?.first_name,
              null
            )
            newEvent.second_teacher = renderUserFullname(
              thisSubject?.second_teacher?.last_name,
              thisSubject?.second_teacher?.first_name,
              null
            )
            newEvent.title = thisSubject?.name
            const subjectColor = subjectColors.find(subjectColor => subjectColor.name === newEvent.title)
            newEvent.bg = mode === 'light' ? subjectColor?.color : subjectColor?.dark_color
            events.push(newEvent)
          }
        }
      }
    }

    return events
  }

  const handleShowDialog = async (id: string) => {
    const confirmed = await showDialog()
    if (confirmed && id) {
      handleDeleteTimetable(id)
    }
  }

  const handleDeleteTimetable = async (id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteTimetable([id]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        router.push('/timetables')
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  if (timetable_detail.error) {
    return <Error error={timetable_detail.error} />
  }

  if (!timetable_detail.loading && timetable_detail.status === 'success') {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={t('TimetableInformation')}
                action={
                  ability?.can('write', 'admin_timetables') && (
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
                        href={`/timetables/edit/${data.id}`}
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
                  )
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={5}>
                  <Grid item xs={12} sm={6} md={6} lg={3}>
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
                  <Grid item xs={12} sm={6} md={6} lg={3}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='Shift' />
                    </Typography>
                    <Typography>{data.shift?.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={3}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      <Translations text='UpdatedTime' />
                    </Typography>
                    <Typography>{format(new Date(data.updated_at), 'dd.MM.yyyy')}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={3}>
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
        </Grid>
        <Grid item xs={12}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={t('TimetableWeekCalendar')}
                action={
                  ability?.can('write', 'admin_timetables') && (
                    <Button
                      variant='tonal'
                      component={Link}
                      href={`/timetables/edit/calendar/${data.id}`}
                      startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                    >
                      <Translations text='Edit' />
                    </Button>
                  )
                }
              />
              <Divider />
              <CardContent sx={{ p: '0!important' }}>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin]}
                  dayHeaderContent={function (arg) {
                    return DAY_NAMES[arg.date.getDay()]
                  }}
                  initialView='timeGridWeek'
                  initialDate={calendarData.startDate}
                  validRange={{
                    start: calendarData.startDate,
                    end: endDate
                  }}
                  firstDay={1}
                  hiddenDays={[0]}
                  allDaySlot={false}
                  navLinks={false}
                  droppable={true}
                  expandRows={true}
                  nowIndicator={false}
                  eventOverlap={false}
                  headerToolbar={false}
                  displayEventTime={false}
                  slotEventOverlap={false}
                  eventDurationEditable={false}
                  dayHeaderFormat={{ weekday: 'short' }}
                  slotLabelFormat={{
                    hour: 'numeric',
                    meridiem: false
                  }}
                  slotMinTime={calendarData.startTime}
                  slotMaxTime={endTime}
                  slotDuration={eventDuration}
                  defaultTimedEventDuration={eventDuration}
                  rerenderDelay={10}
                  events={events}
                  eventColor={'transparent'}
                  eventContent={renderEventContent}
                />
              </CardContent>
            </Card>
          </Grid>
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

TimetableView.acl = {
  action: 'read',
  subject: 'admin_timetables'
}

export default TimetableView
