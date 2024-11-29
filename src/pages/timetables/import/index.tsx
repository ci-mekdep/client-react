// ** MUI Imports
import { ChangeEvent, ElementType, SyntheticEvent, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  ButtonProps,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  ListItemText,
  TextField,
  Typography,
  styled
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { AppDispatch, RootState } from 'src/features/store'
import Icon from 'src/shared/components/icon'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import Translations from 'src/app/layouts/components/Translations'
import { useAuth } from 'src/features/hooks/useAuth'
import SelectSchoolWidget from 'src/widgets/general/SelectSchoolWidget'
import { fetchTimetables, getSampleTimetable, updateTimetable } from 'src/features/store/apps/timetables'
import { useSelector } from 'react-redux'
import TimetableImportModal from 'src/widgets/general/import/TimetableImportModal'
import xmlJs from 'xml-js'
import { TimetableCreateType, TimetableListType } from 'src/entities/classroom/TimetableType'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { fetchSubjects } from 'src/features/store/apps/subjects'
import CustomChip from 'src/shared/components/mui/chip'
import SubjectCard from 'src/widgets/general/SubjectCard'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import { resetWeekHoursSubjects } from 'src/features/utils/resetWeekHoursSubjects'
import { SubjectListType } from 'src/entities/classroom/SubjectType'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import subjectColors from 'src/app/configs/subjectColors'
import { convertAscData } from 'src/features/utils/convertAscData'
import { useRouter } from 'next/router'
import { formatTimetableValue } from 'src/features/utils/formatTimetableValue'
import format from 'date-fns/format'
import { useSettings } from 'src/shared/hooks/useSettings'

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

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
          newEvent.teacher = renderUserFullname(thisSubject?.teacher?.last_name, thisSubject?.teacher?.first_name, null)
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

const TimetablesImport = () => {
  const [inputValue, setInputValue] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [selectedTimetable, setSelectedTimetable] = useState<TimetableListType | null>(null)
  const [subjects, setSubjects] = useState<SubjectListType[]>([])
  const [events, setEvents] = useState<any>([])
  const [calendarData, setCalendarData] = useState({
    startDate: '1970-01-12',
    startTime: '01:00',
    eventsPerDay: 7
  })

  const router = useRouter()
  const { t } = useTranslation()
  const { settings } = useSettings()
  const { current_school } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const { subjects_list } = useSelector((state: RootState) => state.subjects)
  const { timetables_list, timetable_update } = useSelector((state: RootState) => state.timetables)

  useEffect(() => {
    dispatch(
      fetchTimetables({
        limit: 200,
        offset: 0
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (selectedTimetable !== null && selectedTimetable.classroom) {
      setCalendarData(prev => ({ ...prev, eventsPerDay: selectedTimetable?.shift.value[0].length }))
      setEvents([])
      dispatch(
        fetchSubjects({
          limit: 200,
          offset: 0,
          classroom_ids: [selectedTimetable.classroom.id]
        })
      )
    }
  }, [dispatch, selectedTimetable])

  useEffect(() => {
    if (selectedTimetable && !subjects_list.loading && subjects_list.status === 'success') {
      setSubjects(resetWeekHoursSubjects(selectedTimetable.value, subjects_list.data, selectedTimetable.shift.value))
    }
  }, [selectedTimetable, subjects_list.data, subjects_list.loading, subjects_list.status])

  const handleInputFileChange = (file: ChangeEvent<HTMLInputElement>) => {
    if (!selectedTimetable) {
      return
    }

    const reader = new FileReader()
    const { files } = file.target

    if (files && files.length !== 0) {
      reader.readAsText(files[0], 'iso-8859-15')
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const data = e.target?.result as string
        const filteredData = data.replaceAll('Š', 'Ş').replaceAll('š', 'ş')
        const jsonData = xmlJs.xml2js(filteredData, { compact: true }) as any
        const [subjectErrors, timetableArr] = convertAscData(jsonData.timetable, selectedTimetable, subjects)

        if (subjectErrors && subjectErrors?.length > 0) {
          setImportError(
            'Import edýän faýlyňyzdaky käbir ders ýükler tapylmady: ' +
              subjectErrors.map(err => selectedTimetable.classroom.name + '-' + err) +
              ". Daşary programmada dersiň adyny eMekep'däki maglumata görä düzetmegi soraýarys. Bolmasa, degişli mugallymlaryň sapaklary çykmaz."
          )

          return
        } else {
          setImportError(null)
          setSubjects(
            resetWeekHoursSubjects(timetableArr as string[][], subjects_list.data, selectedTimetable.shift.value)
          )

          setEvents(
            generateEvents(
              timetableArr as string[][],
              resetWeekHoursSubjects(timetableArr as string[][], subjects_list.data, selectedTimetable.shift.value),
              settings.mode
            )
          )
        }
      }
      if (reader.result !== null) {
        setInputValue(reader.result as string)
      }
    }
  }

  const handleDownloadFile = (file: string) => {
    const blob = new Blob([file], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    const url = window.URL.createObjectURL(blob)
    link.href = url
    link.setAttribute('download', 'Subjects.csv')
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDownloadSample = () => {
    const toastId = toast.loading(t('ApiLoading'))
    dispatch(getSampleTimetable())
      .unwrap()
      .then(res => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        handleDownloadFile(res)
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  const handleUpdateTimetable = (is_list: boolean) => {
    let dataToSend: TimetableCreateType = {
      id: '',
      shift_id: null,
      classroom_id: null,
      school_id: null,
      this_week: true
    }
    if (selectedTimetable !== null) {
      dataToSend = {
        id: selectedTimetable.id,
        shift_id: selectedTimetable.shift.id,
        classroom_id: selectedTimetable.classroom.id,
        school_id: selectedTimetable.school.id,
        value: formatTimetableValue(events, selectedTimetable.shift.value[0].length)
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

  const handleClose = () => {
    setDialogOpen(false)
  }

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

  useEffect(() => {
    if (selectedTimetable && subjects.length !== 0) {
      const draggableEl = document.getElementById('external-events')

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
  }, [selectedTimetable, subjects.length])

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

  if (current_school === null) return <SelectSchoolWidget />

  return (
    <>
      {dialogOpen && <TimetableImportModal dialogOpen={dialogOpen} handleClose={handleClose} />}
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card sx={{ marginBottom: 8 }}>
            <CardHeader
              title={t('AddMultipleTimetables')}
              action={
                <Box display={'flex'} gap={3}>
                  <Button
                    fullWidth
                    color='primary'
                    variant='contained'
                    sx={{ minWidth: 230 }}
                    startIcon={<Icon icon='tabler:download' />}
                    onClick={handleDownloadSample}
                  >
                    <Translations text='ExportSubjectsCsv' />
                  </Button>
                  <Button
                    fullWidth
                    color='primary'
                    variant='tonal'
                    sx={{ minWidth: 190 }}
                    onClick={() => setDialogOpen(true)}
                    startIcon={<Icon icon='tabler:help' />}
                  >
                    <Translations text='HowToAdd' />
                  </Button>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={6}>
                  <CustomAutocomplete
                    id='timetable_id'
                    size='small'
                    value={selectedTimetable}
                    options={timetables_list.data}
                    loading={timetables_list.loading}
                    loadingText={t('ApiLoading')}
                    onChange={(event: SyntheticEvent, newValue: TimetableListType | null) => {
                      setSelectedTimetable(newValue)
                    }}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => (
                      <li {...props} key={item.id}>
                        <ListItemText>{item.classroom.name}</ListItemText>
                      </li>
                    )}
                    getOptionLabel={option => option.classroom.name || ''}
                    renderInput={params => <TextField {...params} label={t('Timetable')} />}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ButtonStyled
                    color='success'
                    component='label'
                    variant='contained'
                    htmlFor='excel-upload'
                    disabled={!selectedTimetable}
                    startIcon={<Icon icon='tabler:paperclip' fontSize={20} />}
                  >
                    <Translations text='UploadFile' />
                    <input
                      hidden
                      type='file'
                      value={inputValue}
                      disabled={!selectedTimetable}
                      onChange={handleInputFileChange}
                      id='excel-upload'
                    />
                  </ButtonStyled>
                </Grid>
                {importError && (
                  <Grid item xs={12}>
                    <Alert severity='error'>{importError}</Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
          <form
            autoComplete='off'
            onSubmit={e => {
              e.preventDefault()
              handleUpdateTimetable(false)
            }}
          >
            {selectedTimetable && (
              <Grid container spacing={6}>
                <Grid item xs={12} sm={12} md={12} lg={4}>
                  <Card sx={{ maxHeight: 700, overflowY: 'scroll' }}>
                    <CardContent>
                      <CustomChip rounded label={selectedTimetable?.classroom.name} skin='light' color='primary' />
                      <Typography variant='h5' my={4}>
                        <Translations text='Subjects' />
                      </Typography>
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
                </Grid>
                <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6.5)} !important` }}>
                  <Grid container spacing={6} alignItems={'center'}>
                    <Grid item xs={12} sm={12} md={12} lg={4}>
                      <Typography>
                        <Translations text='LastEditedTime' />:{' '}
                        {selectedTimetable?.updated_at &&
                          format(new Date(selectedTimetable.updated_at), 'dd.MM.yyyy HH:mm')}
                      </Typography>
                    </Grid>
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
                          handleUpdateTimetable(true)
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
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </form>
        </Grid>
      </Grid>
    </>
  )
}

TimetablesImport.acl = {
  action: 'write',
  subject: 'admin_timetables'
}

export default TimetablesImport
