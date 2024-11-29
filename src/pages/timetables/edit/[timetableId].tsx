// ** React Imports
import { useState, useEffect, SyntheticEvent, FormEvent } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Component Import
import CustomTextField from 'src/shared/components/mui/text-field'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'

// ** Third Party Imports
import toast from 'react-hot-toast'
import format from 'date-fns/format'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'

// ** Store Imports
import { fetchShifts } from 'src/features/store/apps/shifts'
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import { fetchClassroomsLite } from 'src/features/store/apps/classrooms'
import { convertTimetableData } from 'src/features/utils/api/convertTimetableData'
import { getCurrentTimetable, updateTimetable } from 'src/features/store/apps/timetables'

// ** Types
import { AppDispatch, RootState } from 'src/features/store'
import { ShiftListType } from 'src/entities/classroom/ShiftType'
import { TimetableCreateType } from 'src/entities/classroom/TimetableType'
import { Box, CircularProgress, ListItemText, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import Error from 'src/widgets/general/Error'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'

const defaultValues: TimetableCreateType = {
  value: [],
  shift_id: null,
  classroom_id: null,
  school_id: null
}

const TimetableEdit = () => {
  // ** State
  const [formData, setFormData] = useState<TimetableCreateType>(defaultValues)
  const [classroom, setClassroom] = useState<LiteModelType | null>(null)
  const [school, setSchool] = useState<LiteModelType | null>(null)
  const [shift, setShift] = useState<ShiftListType | null>(null)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const currentTimetableId = router.query.timetableId
  const { timetable_detail, timetable_update } = useSelector((state: RootState) => state.timetables)
  const { shifts_list } = useSelector((state: RootState) => state.shifts)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)

  useEffect(() => {
    dispatch(
      fetchSchoolsLite({
        limit: 750,
        offset: 0,
        is_select: true
      })
    )
    dispatch(
      fetchClassroomsLite({
        limit: 200,
        offset: 0
      })
    )
    dispatch(
      fetchShifts({
        limit: 100,
        offset: 0
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (currentTimetableId !== undefined) {
      dispatch(getCurrentTimetable(currentTimetableId as string))
    }
  }, [dispatch, currentTimetableId])

  useEffect(() => {
    if (
      timetable_detail.data.id === (currentTimetableId as string) &&
      !timetable_detail.loading &&
      timetable_detail.status === 'success' &&
      timetable_detail.data &&
      !shifts_list.loading &&
      shifts_list.status === 'success' &&
      schools_lite_list.data.length !== 0 &&
      classrooms_lite_list.data.length !== 0
    ) {
      setFormData(convertTimetableData(timetable_detail.data))
      setShift(shifts_list.data.find((shift: ShiftListType) => shift.id === timetable_detail.data.shift?.id) || null)
      setSchool(
        schools_lite_list.data.find((school: LiteModelType) => school.key === timetable_detail.data.school?.id) || null
      )
      setClassroom(
        classrooms_lite_list.data.find(
          (classroom: LiteModelType) => classroom.key === timetable_detail.data.classroom?.id
        ) || null
      )
    }
  }, [classrooms_lite_list.data, currentTimetableId, timetable_detail, schools_lite_list.data, shifts_list])

  const handleFormChange = (
    field: keyof TimetableCreateType,
    value: TimetableCreateType[keyof TimetableCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: TimetableCreateType, is_list: boolean) => {
    event?.preventDefault()

    dispatch(updateTimetable(data))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        router.push(is_list === true ? '/timetables' : `/timetables/view/${res.timetable.id}`)
      })
      .catch(err => {
        const errorObject: ErrorKeyType = {}
        err.errors?.map((err: ErrorModelType) => {
          if (err.key && err.code) {
            errorObject[err.key] = err.code
          }
        })
        setErrors(errorObject)
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  if (timetable_detail.error) {
    return <Error error={timetable_detail.error} />
  }

  if (classrooms_lite_list.error) {
    return <Error error={classrooms_lite_list.error} />
  }

  if (!timetable_detail.loading && currentTimetableId) {
    return (
      <>
        <form
          autoComplete='off'
          onSubmit={e => {
            onSubmit(e, formData, false)
          }}
        >
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={t('TimetableInformation')}
                  action={
                    <Typography>
                      <Translations text='LastEditedTime' />:{' '}
                      {formData.updated_at && format(new Date(formData.updated_at), 'dd.MM.yyyy HH:mm')}
                    </Typography>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={6}>
                    <Grid item xs={12} sm={6}>
                      <CustomAutocomplete
                        id='classroom_id'
                        value={classroom}
                        options={classrooms_lite_list.data}
                        loading={classrooms_lite_list.loading}
                        loadingText={t('ApiLoading')}
                        onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                          setClassroom(newValue)
                          handleFormChange('classroom_id', newValue?.key)
                        }}
                        noOptionsText={t('NoRows')}
                        renderOption={(props, item) => (
                          <li {...props} key={item.key}>
                            <ListItemText>{item.value}</ListItemText>
                          </li>
                        )}
                        getOptionLabel={option => option.value || ''}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            {...(errors && errors['classroom_id']
                              ? { error: true, helperText: errorTextHandler(errors['classroom_id']) }
                              : null)}
                            inputProps={{ ...params.inputProps, tabIndex: 1 }}
                            label={t('Classroom')}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomAutocomplete
                        id='shift_id'
                        value={shift}
                        options={shifts_list.data}
                        loading={shifts_list.loading}
                        loadingText={t('ApiLoading')}
                        noOptionsText={t('NoRows')}
                        onChange={(event: SyntheticEvent, newValue: ShiftListType | null) => {
                          setShift(newValue)
                          handleFormChange('shift_id', newValue?.id)
                        }}
                        renderOption={(props, item) => (
                          <li {...props} key={item.id}>
                            <ListItemText>{item.name}</ListItemText>
                          </li>
                        )}
                        getOptionLabel={option => option.name || ''}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            {...(errors && errors['shift_id']
                              ? { error: true, helperText: errorTextHandler(errors['shift_id']) }
                              : null)}
                            inputProps={{ ...params.inputProps, tabIndex: 2 }}
                            label={t('Shift')}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomAutocomplete
                        id='school_id'
                        value={school}
                        options={schools_lite_list.data}
                        loading={schools_lite_list.loading}
                        loadingText={t('ApiLoading')}
                        onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                          setSchool(newValue)
                          handleFormChange('school_id', newValue?.key)
                        }}
                        noOptionsText={t('NoRows')}
                        renderOption={(props, item) => (
                          <li {...props} key={item.key}>
                            <ListItemText>{item.value}</ListItemText>
                          </li>
                        )}
                        getOptionLabel={option => option.value || ''}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            {...(errors && errors['school_id']
                              ? { error: true, helperText: errorTextHandler(errors['school_id']) }
                              : null)}
                            inputProps={{ ...params.inputProps, tabIndex: 3 }}
                            label={t('School')}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
              <Button variant='contained' sx={{ mr: 4 }} disabled={timetable_update.loading} type='submit'>
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
                sx={{ mr: 4 }}
                disabled={timetable_update.loading}
                onClick={() => {
                  onSubmit(null, formData as TimetableCreateType, true)
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
        </form>
      </>
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

TimetableEdit.acl = {
  action: 'write',
  subject: 'admin_timetables'
}

export default TimetableEdit
