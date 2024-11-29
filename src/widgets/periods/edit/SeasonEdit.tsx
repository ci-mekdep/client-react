// ** React Imports
import { FormEvent, SyntheticEvent, forwardRef, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'

// ** Custom Component Import
import CustomTextField from 'src/shared/components/mui/text-field'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'

// ** Third Party Imports
import toast from 'react-hot-toast'
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Utils Imports
import { convertPeriodData } from 'src/features/utils/api/convertPeriodData'

// ** Store Imports
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import { getCurrentPeriod, updatePeriod } from 'src/features/store/apps/periods'

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { PeriodCreateType, PeriodType } from 'src/entities/school/PeriodType'
import { CircularProgress, ListItemText } from '@mui/material'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import Error from 'src/widgets/general/Error'
import { useSelector } from 'react-redux'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'

const defaultValues: PeriodCreateType = {
  title: '',
  value: [],
  school_id: null
}

interface PickerProps {
  date: Date | string
  label: string
  indexVal: number
}

const CustomInput = forwardRef((props: PickerProps, ref) => {
  const date = props.date !== null ? format(new Date(props.date), 'dd.MM.yyyy') : ''
  const label = props.label
  const tabIndex = props.indexVal

  return (
    <CustomTextField
      {...props}
      fullWidth
      size='small'
      label={label}
      value={date}
      inputRef={ref}
      InputProps={{
        inputProps: { tabIndex: tabIndex },
        startAdornment: (
          <InputAdornment position='start'>
            <Icon fontSize='1.25rem' icon='tabler:calendar-plus' />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position='end'>
            <Icon fontSize='1.25rem' icon='tabler:chevron-down' />
          </InputAdornment>
        )
      }}
    />
  )
})

type QuarterRow = Date | null

interface QuartersType {
  rows: QuarterRow[][]
}

const SeasonEdit = () => {
  // ** State
  const [quarters, setQuarters] = useState<QuartersType>({
    rows: [[null, null]]
  })
  const [formData, setFormData] = useState<PeriodCreateType>(defaultValues)
  const [school, setSchool] = useState<LiteModelType | null>(null)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const currentPeriodId = router.query.periodId
  const dispatch = useDispatch<AppDispatch>()
  const { period_detail, period_update } = useSelector((state: RootState) => state.periods)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)

  useEffect(() => {
    dispatch(
      fetchSchoolsLite({
        limit: 750,
        offset: 0,
        is_select: true
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (currentPeriodId !== undefined) {
      dispatch(getCurrentPeriod(currentPeriodId as string))
    }
  }, [dispatch, currentPeriodId])

  useEffect(() => {
    if (currentPeriodId !== undefined && schools_lite_list.data.length !== 0) {
      const detailData: PeriodType = { ...(period_detail.data as PeriodType) }
      setSchool(schools_lite_list.data.find((school: LiteModelType) => school.key === detailData?.school?.id) || null)
      setQuarters({ rows: detailData.value?.map((quarters: string[]) => quarters.map(date => new Date(date))) })
      setFormData(convertPeriodData(detailData))
    }
  }, [currentPeriodId, period_detail.data, schools_lite_list.data])

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: PeriodCreateType, is_list: boolean) => {
    event?.preventDefault()

    const values = quarters.rows.map(quarters => quarters.map(date => (date ? format(date as Date, 'yyyy-MM-dd') : '')))

    data.value = values

    dispatch(updatePeriod(data))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        router.push(is_list === true ? '/periods' : `/periods/view/${res.period.id}`)
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

  const handleFormChange = (field: keyof PeriodCreateType, value: PeriodCreateType[keyof PeriodCreateType]) => {
    setFormData({ ...formData, [field]: value })
  }

  if (period_detail.error) {
    return <Error error={period_detail.error} />
  }

  if (!period_detail.loading && currentPeriodId) {
    return (
      <DatePickerWrapper>
        <form
          autoComplete='off'
          onSubmit={e => {
            onSubmit(e, formData, false)
          }}
        >
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title={t('SeasonInformation')} />
                <Divider />
                <CardContent>
                  <Grid container spacing={6}>
                    <Grid item xs={12} sm={6}>
                      <CustomTextField
                        fullWidth
                        label={t('Name')}
                        value={formData.title}
                        InputProps={{ inputProps: { tabIndex: 1 } }}
                        onChange={e => handleFormChange('title', e.target.value)}
                        {...(errors && errors['title']
                          ? { error: true, helperText: errorTextHandler(errors['title']) }
                          : null)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomAutocomplete
                        fullWidth
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
                            inputProps={{ ...params.inputProps, tabIndex: 2 }}
                            label={t('EduCenter')}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        locale='tm'
                        id='start-date'
                        autoComplete='off'
                        showYearDropdown
                        showMonthDropdown
                        selected={quarters.rows[0][0]}
                        dateFormat='dd.MM.yyyy'
                        placeholderText={`${t('SelectDate')}`}
                        calendarStartDay={1}
                        onChange={(date: Date) => {
                          setQuarters(prev => ({
                            rows: [
                              ...prev.rows.map((row, index) => {
                                if (index === 0) {
                                  row[0] = date
                                }

                                return row
                              })
                            ]
                          }))
                        }}
                        customInput={
                          <CustomInput
                            label={t('SeasonStartDate')}
                            indexVal={3}
                            date={quarters.rows[0][0] as Date | string}
                          />
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        locale='tm'
                        id='start-date'
                        autoComplete='off'
                        showYearDropdown
                        showMonthDropdown
                        selected={quarters.rows[0][1]}
                        dateFormat='dd.MM.yyyy'
                        placeholderText={`${t('SelectDate')}`}
                        calendarStartDay={1}
                        onChange={(date: Date) => {
                          setQuarters(prev => ({
                            rows: [
                              ...prev.rows.map((row, index) => {
                                if (index === 0) {
                                  row[1] = date
                                }

                                return row
                              })
                            ]
                          }))
                        }}
                        customInput={
                          <CustomInput
                            label={t('SeasonEndDate')}
                            indexVal={4}
                            date={quarters.rows[0][1] as Date | string}
                          />
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
              <Button variant='contained' sx={{ mr: 4 }} disabled={period_update.loading} type='submit'>
                {period_update.loading ? (
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
                disabled={period_update.loading}
                onClick={() => {
                  onSubmit(null, formData, true)
                }}
              >
                {period_update.loading ? (
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
      </DatePickerWrapper>
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

export default SeasonEdit
