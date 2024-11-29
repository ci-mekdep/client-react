// ** React Imports
import { FormEvent, SyntheticEvent, useEffect, useState } from 'react'

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

// ** Type Imports
import { TimetableCreateType } from 'src/entities/classroom/TimetableType'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

// ** Store Imports
import { fetchShifts } from 'src/features/store/apps/shifts'
import { addTimetable } from 'src/features/store/apps/timetables'
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import { fetchClassroomsLite } from 'src/features/store/apps/classrooms'

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { ShiftListType } from 'src/entities/classroom/ShiftType'
import { CircularProgress, ListItemText } from '@mui/material'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import useKeyboardSubmit from 'src/features/hooks/useKeyboardSubmit'

const defaultValues: TimetableCreateType = {
  value: [],
  shift_id: null,
  classroom_id: null,
  school_id: null
}

const TimetableCreate = () => {
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
  const { timetable_add } = useSelector((state: RootState) => state.timetables)
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
        limit: 500,
        offset: 0
      })
    )
  }, [dispatch])

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: TimetableCreateType, is_list: boolean | string) => {
    event?.preventDefault()

    dispatch(addTimetable(data))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        if (is_list === 'new') {
          router.replace(router.asPath)
          setFormData(defaultValues)
          setClassroom(null)
          setSchool(null)
          setShift(null)
        } else {
          router.push(is_list === true ? '/timetables' : `/timetables/view/${res.timetable.id}`)
        }
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

  const handleFormChange = (
    field: keyof TimetableCreateType,
    value: TimetableCreateType[keyof TimetableCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = () => {
    onSubmit(null, formData, 'new')
  }

  const handleSubmitAndList = () => {
    onSubmit(null, formData, false)
  }

  useKeyboardSubmit(handleSubmit, handleSubmitAndList)

  return (
    <form
      autoComplete='off'
      onSubmit={e => {
        onSubmit(e, formData, false)
      }}
    >
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('TimetableInformation')} />
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
                    getOptionLabel={option => option.name || ''}
                    renderOption={(props, item) => (
                      <li {...props} key={item.id}>
                        <ListItemText>{item.name}</ListItemText>
                      </li>
                    )}
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
                    noOptionsText={t('NoRows')}
                    onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                      setSchool(newValue)
                      handleFormChange('school_id', newValue?.key)
                    }}
                    getOptionLabel={option => option.value}
                    renderOption={(props, item) => (
                      <li {...props} key={item.key}>
                        <ListItemText>{item.value}</ListItemText>
                      </li>
                    )}
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
          <Button variant='contained' sx={{ mr: 4 }} disabled={timetable_add.loading} type='submit'>
            {timetable_add.loading ? (
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
            disabled={timetable_add.loading}
            onClick={() => {
              onSubmit(null, formData as TimetableCreateType, true)
            }}
          >
            {timetable_add.loading ? (
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
  )
}

TimetableCreate.acl = {
  action: 'write',
  subject: 'admin_timetables'
}

export default TimetableCreate
