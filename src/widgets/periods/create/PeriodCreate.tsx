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

import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

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

// ** Store Imports
import { addPeriod } from 'src/features/store/apps/periods'
import { fetchSchoolsLite } from 'src/features/store/apps/school'

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { PeriodCreateType } from 'src/entities/school/PeriodType'
import { CircularProgress, ListItemText } from '@mui/material'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { useSelector } from 'react-redux'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import { fetchSettings } from 'src/features/store/apps/settings'
import useKeyboardSubmit from 'src/features/hooks/useKeyboardSubmit'

const defaultValues: PeriodCreateType = {
  title: '',
  value: [],
  school_id: null
}

interface PickerProps {
  date: Date | string
}

const CustomInput = forwardRef((props: PickerProps, ref) => {
  const date = props.date !== null ? format(new Date(props.date), 'dd.MM.yyyy') : ''

  return (
    <CustomTextField
      {...props}
      size='small'
      value={date}
      inputRef={ref}
      InputProps={{
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

const PeriodCreate = () => {
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
  const dispatch = useDispatch<AppDispatch>()
  const { period_add } = useSelector((state: RootState) => state.periods)
  const { settings } = useSelector((state: RootState) => state.settings)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)

  useEffect(() => {
    dispatch(
      fetchSchoolsLite({
        limit: 750,
        offset: 0,
        is_select: true
      })
    )
    dispatch(fetchSettings({}))
  }, [dispatch])

  useEffect(() => {
    if (!settings.loading && settings.status === 'success' && settings.data) {
      setQuarters({
        rows: settings.data.general?.default_period.value.map((row: string[]) => row.map(val => new Date(val)))
      })
    }
  }, [settings])

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: PeriodCreateType, is_list: boolean | string) => {
    event?.preventDefault()

    const values = quarters.rows.map(quarters => quarters.map(date => (date ? format(date as Date, 'yyyy-MM-dd') : '')))

    data.value = values

    dispatch(addPeriod(data))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        if (is_list === 'new') {
          router.replace(router.asPath)
          setFormData(defaultValues)
          setQuarters({
            rows: [[null, null]]
          })
          setSchool(null)
          dispatch(fetchSettings({}))
        } else {
          router.push(is_list === true ? '/periods' : `/periods/view/${res.period.id}`)
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

  const handleFormChange = (field: keyof PeriodCreateType, value: PeriodCreateType[keyof PeriodCreateType]) => {
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
              <CardHeader title={t('PeriodInformation')} />
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
                          label={t('School')}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={t('QuarterInformation')}
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: '15px' }}>
                    <Button
                      variant='tonal'
                      color='success'
                      fullWidth
                      startIcon={<Icon icon='tabler:plus' />}
                      onClick={() => {
                        if (quarters.rows.length < 12) {
                          setQuarters(prev => ({
                            rows: [...prev.rows, [null, null]]
                          }))
                        }
                      }}
                    >
                      <Translations text='Add' />
                    </Button>
                    <Button
                      variant='tonal'
                      color='error'
                      fullWidth
                      startIcon={<Icon icon='tabler:minus' />}
                      onClick={() => {
                        if (quarters.rows.length > 1) {
                          setQuarters(prev => ({
                            rows: prev.rows.slice(0, prev.rows.length - 1)
                          }))
                        }
                      }}
                    >
                      <Translations text='Remove' />
                    </Button>
                  </Box>
                }
              />
              <Divider />
              <CardContent sx={{ p: '0 !important' }}>
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
                      {quarters.rows?.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          sx={{
                            '&:last-of-type td, &:last-of-type th': {
                              border: 0
                            }
                          }}
                        >
                          <TableCell component='th' scope='row'>
                            {rowIndex + 1} <Translations text='Quarter' />
                          </TableCell>
                          {row.map((date, innerIndex) => (
                            <TableCell key={innerIndex}>
                              <DatePicker
                                locale='tm'
                                id='start-date'
                                autoComplete='off'
                                showYearDropdown
                                showMonthDropdown
                                preventOpenOnFocus
                                selected={date}
                                dateFormat='dd.MM.yyyy'
                                placeholderText={`${t('SelectDate')}`}
                                calendarStartDay={1}
                                onChange={(date: Date) => {
                                  setQuarters(prev => ({
                                    rows: [
                                      ...prev.rows.map((row, index) => {
                                        if (index === rowIndex) {
                                          row[innerIndex] = date
                                        }

                                        return row
                                      })
                                    ]
                                  }))
                                }}
                                customInput={<CustomInput date={date as Date | string} />}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
            <Button variant='contained' sx={{ mr: 4 }} disabled={period_add.loading} type='submit'>
              {period_add.loading ? (
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
              disabled={period_add.loading}
              onClick={() => {
                onSubmit(null, formData, true)
              }}
            >
              {period_add.loading ? (
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
}

export default PeriodCreate
