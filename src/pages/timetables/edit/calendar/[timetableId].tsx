// ** React Imports
import { FormEvent, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Radio from '@mui/material/Radio'
import Button from '@mui/material/Button'
import RadioGroup from '@mui/material/RadioGroup'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Third party libraries
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'

// ** Custom Component Import
import CustomChip from 'src/shared/components/mui/chip'
import SubjectCard from 'src/widgets/general/SubjectCard'

// ** Icon Imports
import toast from 'react-hot-toast'
import format from 'date-fns/format'

// ** Util Imports
import subjectColors from 'src/app/configs/subjectColors'
import { fetchSubjects } from 'src/features/store/apps/subjects'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { formatTimetableValue } from 'src/features/utils/formatTimetableValue'
import { resetWeekHoursSubjects } from 'src/features/utils/resetWeekHoursSubjects'
import { getCurrentTimetable, updateTimetable } from 'src/features/store/apps/timetables'

// ** Type Imports
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { SubjectListType } from 'src/entities/classroom/SubjectType'
import { TimetableCreateType, TimetableType } from 'src/entities/classroom/TimetableType'
import { CircularProgress } from '@mui/material'
import Translations from 'src/app/layouts/components/Translations'
import { useSelector } from 'react-redux'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import Error from 'src/widgets/general/Error'
import { useTranslation } from 'react-i18next'
import { useSettings } from 'src/shared/hooks/useSettings'
import { fetchSettings } from 'src/features/store/apps/settings'

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

const CalendarEdit = () => {
  const router = useRouter()
  const id = router.query.timetableId
  const [events, setEvents] = useState<any>([])
  const [thisWeek, setThisWeek] = useState<string>('false')
  const [subjects, setSubjects] = useState<SubjectListType[]>([])
  const [subjectsSum, setSubjectsSum] = useState<number>(0)
  const [calendarData, setCalendarData] = useState({
    startDate: '1970-01-12',
    startTime: '01:00',
    eventsPerDay: 7
  })

  const { t } = useTranslation()
  const { settings: uiSettings } = useSettings()
  const { settings } = useSelector((state: RootState) => state.settings)
  const { subjects_list } = useSelector((state: RootState) => state.subjects)
  const { timetable_detail, timetable_update } = useSelector((state: RootState) => state.timetables)
  const data: TimetableType = { ...timetable_detail.data }

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
  const startTimeMinutes = stringToTime(calendarData.startTime)
  const eventDurationMinutes = stringToTime('02:00') - stringToTime('01:00')
  const eventDuration = timeToString(eventDurationMinutes)
  const endTime = timeToString(startTimeMinutes + calendarData.eventsPerDay * eventDurationMinutes)
  const endDate = unixTimeToDate(dateToUnixTime(calendarData.startDate) + 6 * 24 * 3600).toLocaleDateString()

  const dispatch = useDispatch<AppDispatch>()

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
              second_teacher: null,
              child_teacher: null
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

  useEffect(() => {
    if (id !== undefined && timetable_detail.data.id !== (id as string)) {
      dispatch(getCurrentTimetable(id as string))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id])

  useEffect(() => {
    dispatch(fetchSettings({}))
  }, [dispatch])

  useEffect(() => {
    if (
      id !== undefined &&
      !timetable_detail.loading &&
      timetable_detail.status === 'success' &&
      timetable_detail.data &&
      timetable_detail.data.id === (id as string)
    ) {
      setCalendarData(prev => ({ ...prev, eventsPerDay: timetable_detail.data?.shift?.value[0].length }))
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
      setSubjects(
        resetWeekHoursSubjects(timetable_detail.data.value, subjects_list.data, timetable_detail.data.shift.value)
      )
      setEvents(
        generateEvents(
          timetable_detail.data.value,
          resetWeekHoursSubjects(timetable_detail.data.value, subjects_list.data, timetable_detail.data.shift.value),
          uiSettings.mode
        )
      )
    }
  }, [timetable_detail, id, subjects_list, uiSettings])

  useEffect(() => {
    if (subjects.length !== 0) {
      setSubjectsSum(
        subjects.reduce((accumulator, subject: SubjectListType) => {
          return accumulator + subject.week_hours
        }, 0)
      )
    }
  }, [subjects])

  useEffect(() => {
    if (!timetable_detail.loading && timetable_detail.status === 'success' && subjects.length !== 0) {
      const draggableEl = document.getElementById('external-events')

      if (draggableEl) {
        const draggable = new Draggable(draggableEl as HTMLElement, {
          itemSelector: '.fc-event',
          eventData: function (eventEl) {
            const id = eventEl.getAttribute('data-id')
            const bg = eventEl.getAttribute('data-bg')
            const name = eventEl.getAttribute('data-name')
            const teacher = eventEl.getAttribute('data-teacher')
            const hours = eventEl.getAttribute('data-hours')
            const child_teacher = eventEl.getAttribute('data-child-teacher')
            const second_teacher = eventEl.getAttribute('data-second-teacher')

            return {
              id: id,
              bg: bg,
              title: name,
              subject_id: id,
              hours: hours,
              teacher: teacher,
              child_teacher: child_teacher,
              second_teacher: second_teacher,
              create: hours && parseInt(hours) > 0 ? true : false
            }
          }
        })

        return () => draggable.destroy()
      }
    }
  }, [timetable_detail.loading, timetable_detail.status, subjects])

  const handleEventChange = (data: any) => {
    if (events !== null) {
      const newState = events.map((event: SubjectListType) => {
        if (event.id === data.event.id) {
          return { ...event, start: data.event.start, end: data.event.end }
        }

        return event
      })

      setEvents(newState)
    }
  }

  const handleEventReceive = (data: any) => {
    const title = data.event.title
    if (title == null || title == '') {
      return
    } else {
      let newEvent = {}
      newEvent = {
        id: Math.floor((Date.now() * Math.random()) % 10000).toString(),
        title: title,
        start: data.event.start,
        end: new Date(data.event.start.setTime(data.event.start.getTime() + 60 * 60 * 1000)),
        bg: data.event.extendedProps.bg,
        teacher: data.event.extendedProps.teacher,
        subject_id: data.event.extendedProps.subject_id,
        second_teacher: data.event.extendedProps.second_teacher,
        child_teacher: data.event.extendedProps.child_teacher
      }

      if (subjects.length !== 0) {
        const newState = subjects.map((subject: SubjectListType) => {
          if (subject.id === data.event.id) {
            return { ...subject, week_hours: subject.week_hours - 1 }
          }

          return subject
        })

        setSubjects(newState)
      }
      setEvents((current: any) => [...current, newEvent])
    }
  }

  const handleEventClick = (eventInfo: any) => {
    eventInfo.event.remove()
    if (subjects.length !== 0) {
      const newState = subjects.map((subject: SubjectListType) => {
        if (subject.id === eventInfo.event.extendedProps.subject_id) {
          return { ...subject, week_hours: subject.week_hours + 1 }
        }

        return subject
      })

      setSubjects(newState)
    }
    const updatedEvents = events.filter((event: any) => event.id !== eventInfo.event.id)
    setEvents(updatedEvents)
  }

  const handleClearTimetable = () => {
    setSubjects(resetWeekHoursSubjects([], subjects_list.data, timetable_detail.data.shift.value))
    setEvents([])
  }

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, is_list: boolean) => {
    event?.preventDefault()

    let dataToSend: TimetableCreateType = {
      id: '',
      shift_id: null,
      classroom_id: null,
      school_id: null
    }
    if (data !== null) {
      dataToSend = {
        id: data.id,
        shift_id: data.shift.id,
        classroom_id: data.classroom.id,
        school_id: data.school.id,
        ...(settings.data.general?.timetable_update_week_available === true
          ? { this_week: thisWeek === 'true' ? true : false }
          : null),
        value: formatTimetableValue(events, data.shift?.value[0].length)
      }
    }

    dispatch(updateTimetable(dataToSend))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        router.push(is_list === true ? '/timetables' : `/timetables/view/${res.timetable.id}`)
      })
      .catch(err => {
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  if (timetable_detail.error) {
    return <Error error={timetable_detail.error} />
  }

  if (!timetable_detail.loading && id && !subjects_list.loading && subjects_list.status === 'success') {
    return (
      <form
        autoComplete='off'
        onSubmit={e => {
          onSubmit(e, false)
        }}
      >
        <Grid container spacing={6}>
          <Grid item xs={12} sm={12} md={12} lg={4}>
            <Card sx={{ maxHeight: 700, overflowY: 'scroll' }}>
              <CardContent>
                <CustomChip rounded label={data?.classroom?.name} skin='light' color='primary' />
                <Box
                  sx={{
                    margin: theme => theme.spacing(3, 0, 3),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant='h5'>
                    <Translations text='RemainingSubjects' />: {subjectsSum}
                  </Typography>
                </Box>
                <Typography mb={3} variant='body2'>
                  <Translations text='SubjectListCardDesc' />
                </Typography>
                <Box id='external-events'>
                  {subjects?.map(subject => (
                    <SubjectCard
                      key={subject.id}
                      data={subject.id}
                      teacher={subject.teacher}
                      child_teacher={subject.child_teacher}
                      name={subject.name}
                      week_hours={subject.week_hours}
                      second_teacher={subject.second_teacher}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={8}>
            <FullCalendar
              height={700}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
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
              editable={true}
              allDaySlot={false}
              navLinks={false}
              droppable={true}
              expandRows={true}
              nowIndicator={false}
              eventOverlap={false}
              headerToolbar={false}
              eventMinWidth={999}
              slotMinWidth={999}
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
              eventClick={handleEventClick}
              eventChange={handleEventChange}
              eventContent={renderEventContent}
              eventReceive={handleEventReceive}
            />
            {events.length > 0 && (
              <Box display='flex' justifyContent='end' py={2}>
                <Button variant='tonal' color='primary' onClick={handleClearTimetable}>
                  <Translations text='ClearAllSubjects' />
                </Button>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6.5)} !important` }}>
            <Grid container spacing={6} alignItems={'center'}>
              <Grid item xs={12} sm={12} md={12} lg={4}>
                <Typography>
                  <Translations text='LastEditedTime' />:{' '}
                  {data?.updated_at && format(new Date(data.updated_at), 'dd.MM.yyyy HH:mm')}
                </Typography>
              </Grid>
              {settings.data.general?.timetable_update_week_available === true ? (
                <Grid item xs={12} sm={12} md={12} lg={3}>
                  <Card>
                    <CardContent sx={{ padding: theme => theme.spacing(0.5, 3) + '!important' }}>
                      <RadioGroup
                        row
                        aria-label='thisWeek'
                        name='thisWeek'
                        value={thisWeek}
                        sx={{ display: 'flex', flexDirection: 'column' }}
                        onChange={event => {
                          setThisWeek((event.target as HTMLInputElement).value)
                        }}
                      >
                        <FormControlLabel value='false' control={<Radio />} label={t('UpdateFromNextWeek')} />
                        <FormControlLabel value='true' control={<Radio />} label={t('UpdateFromThisWeek')} />
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </Grid>
              ) : null}
              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                lg={5}
                textAlign={'end'}
                display={'flex'}
                justifyContent={'end'}
                gap={4}
              >
                <Button variant='contained' disabled={timetable_update.loading} type='submit'>
                  {timetable_update.loading ? (
                    <CircularProgress
                      sx={{
                        width: '20px !important',
                        height: '20px !important',
                        mr: theme => theme.spacing(2)
                      }}
                    />
                  ) : null}
                  <Translations text='Submit' />
                </Button>
                <Button
                  variant='contained'
                  disabled={timetable_update.loading}
                  onClick={() => {
                    onSubmit(null, true)
                  }}
                >
                  {timetable_update.loading ? (
                    <CircularProgress
                      sx={{
                        width: '20px !important',
                        height: '20px !important',
                        mr: theme => theme.spacing(2)
                      }}
                    />
                  ) : null}
                  <Translations text='SubmitAndList' />
                </Button>
                <Button variant='tonal' color='secondary' onClick={() => router.back()}>
                  <Translations text='GoBack' />
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
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

CalendarEdit.acl = {
  action: 'write',
  subject: 'admin_timetables'
}

export default CalendarEdit
