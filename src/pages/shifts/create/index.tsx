// ** React Imports
import { FormEvent, ReactElement, Ref, forwardRef, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import {
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Fade,
  FadeProps,
  FormControlLabel,
  IconButton,
  IconButtonProps,
  ListItemText,
  Typography,
  styled
} from '@mui/material'
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
import TableCell, { TableCellBaseProps } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

// ** Custom Component Import
import CustomTextField from 'src/shared/components/mui/text-field'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'

// ** Third Party Imports
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Store Imports
import { addShift } from 'src/features/store/apps/shifts'
import { fetchSchoolsLite } from 'src/features/store/apps/school'

// ** Utils Imports
import generateShift from 'src/features/utils/generateShift'

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { ErrorKeyType, ErrorModelType, LiteModelType, ShiftGenerateType } from 'src/entities/app/GeneralTypes'
import { ShiftCreateType } from 'src/entities/classroom/ShiftType'
import { SyntheticEvent } from 'react-draft-wysiwyg'
import { reverseArray } from 'src/features/utils/reverseArray'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import { useSelector } from 'react-redux'
import useKeyboardSubmit from 'src/features/hooks/useKeyboardSubmit'
import { useAuth } from 'src/features/hooks/useAuth'

interface PickerProps {
  label?: string
  readOnly?: boolean
}

const CustomCloseButton = styled(IconButton)<IconButtonProps>(({ theme }) => ({
  top: 0,
  right: 0,
  color: 'grey.500',
  position: 'absolute',
  boxShadow: theme.shadows[2],
  transform: 'translate(10px, -10px)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette.background.paper} !important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'translate(7px, -5px)'
  }
}))

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

const CustomInput = forwardRef(({ ...props }: PickerProps, ref) => {
  // ** Props
  const { label, readOnly } = props

  return (
    <CustomTextField
      {...props}
      fullWidth
      inputRef={ref}
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <Icon icon='tabler:calendar-time' />
          </InputAdornment>
        )
      }}
      label={label || ''}
      {...(readOnly && { inputProps: { readOnly: true } })}
    />
  )
})

const MUITableCell = styled(TableCell)<TableCellBaseProps>(({ theme }) => ({
  '&:not(:first-of-type)': {
    borderLeft: `1px solid ${theme.palette.divider}`
  }
}))

const defaultValues: ShiftCreateType = {
  school_id: null,
  name: '',
  value: []
}

const defaultGenerateShiftData: ShiftGenerateType = {
  startTime: new Date('1970-01-01T08:30:00.000'),
  lessonDuration: Number(45),
  maxLessonsPerDay: Number(6),
  shortBreakDuration: Number(5),
  longBreakDuration: Number(15),
  bigBreakIndex: Number(3)
}

const ShiftCreate = () => {
  // ** State
  const [show, setShow] = useState<boolean>(false)
  const [formData, setFormData] = useState<ShiftCreateType>(defaultValues)
  const [generateShiftData, setGenerateShiftData] = useState<ShiftGenerateType>(defaultGenerateShiftData)
  const [enabledDays, setEnabledDays] = useState<number[]>([0, 1, 2, 3, 4, 5])
  const defaultShiftTimes = [
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []]
  ]
  const [shiftTimes, setShiftTimes] = useState<string[][][]>(defaultShiftTimes)
  const [school, setSchool] = useState<LiteModelType | null>(null)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const { is_secondary_school } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const { shift_add } = useSelector((state: RootState) => state.shifts)
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
    setFormData({ ...formData, value: reverseArray(shiftTimes) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftTimes])

  const handleFormChange = (field: keyof ShiftCreateType, value: ShiftCreateType[keyof ShiftCreateType]) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleGenerateShift = () => {
    setShiftTimes(generateShift(generateShiftData, enabledDays))
    toast.success(t('CreatedSuccessfully'), { duration: 2000 })
  }

  useEffect(() => {
    setShiftTimes(generateShift(generateShiftData, enabledDays))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledDays])

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: ShiftCreateType, is_list: boolean | string) => {
    event?.preventDefault()

    dispatch(addShift(data))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        if (is_list === 'new') {
          router.replace(router.asPath)
          setFormData(defaultValues)
          setGenerateShiftData(defaultGenerateShiftData)
          setShiftTimes(defaultShiftTimes)
          setEnabledDays([0, 1, 2, 3, 4, 5])
          setSchool(null)
          setShow(false)
        } else {
          router.push(is_list === true ? '/shifts' : `/shifts/view/${res.shift.id}`)
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

  const handleSubmit = () => {
    onSubmit(null, formData, 'new')
  }

  const handleSubmitAndList = () => {
    onSubmit(null, formData, false)
  }

  useKeyboardSubmit(handleSubmit, handleSubmitAndList)

  return (
    <>
      <Dialog
        fullWidth
        open={show}
        maxWidth='md'
        scroll='body'
        onClose={() => setShow(false)}
        TransitionComponent={Transition}
        onBackdropClick={() => setShow(false)}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DatePickerWrapper>
          <DialogContent
            sx={{
              pb: theme => `${theme.spacing(8)} !important`,
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <CustomCloseButton onClick={() => setShow(false)}>
              <Icon icon='tabler:x' fontSize='1.25rem' />
            </CustomCloseButton>
            <Typography variant='h3' textAlign={'center'} fontWeight={600} sx={{ mb: 8 }}>
              <Translations text='AutoCreate' />
            </Typography>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  locale='tm'
                  id='startTime'
                  autoComplete='off'
                  showTimeSelect
                  showYearDropdown
                  showMonthDropdown
                  timeIntervals={5}
                  dateFormat='HH:mm'
                  timeFormat='HH:mm'
                  showTimeSelectOnly
                  onKeyDown={e => {
                    e.preventDefault()
                  }}
                  placeholderText={t('HourAndMinute') as string}
                  selected={generateShiftData?.startTime}
                  onChange={(date: Date) => setGenerateShiftData({ ...generateShiftData, startTime: date })}
                  customInput={<CustomInput label={t('SubjectStartTime') as string} />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label={t('SubjectDuration')}
                  type='number'
                  onWheel={event => event.target instanceof HTMLElement && event.target.blur()}
                  value={generateShiftData.lessonDuration}
                  onChange={e => setGenerateShiftData({ ...generateShiftData, lessonDuration: Number(e.target.value) })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Translations text='Minute' />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  label={t('StandartBreakTime')}
                  type='number'
                  onWheel={event => event.target instanceof HTMLElement && event.target.blur()}
                  value={generateShiftData.shortBreakDuration}
                  onChange={e =>
                    setGenerateShiftData({ ...generateShiftData, shortBreakDuration: Number(e.target.value) })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Icon icon='tabler:calendar-time' />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Translations text='Minute' />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  label={t('LongBreakTime')}
                  type='number'
                  onWheel={event => event.target instanceof HTMLElement && event.target.blur()}
                  value={generateShiftData.longBreakDuration}
                  onChange={e =>
                    setGenerateShiftData({ ...generateShiftData, longBreakDuration: Number(e.target.value) })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Icon icon='tabler:calendar-time' />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Translations text='Minute' />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  label={t('LongBreakStart')}
                  type='number'
                  onWheel={event => event.target instanceof HTMLElement && event.target.blur()}
                  value={generateShiftData.bigBreakIndex}
                  onChange={e => setGenerateShiftData({ ...generateShiftData, bigBreakIndex: Number(e.target.value) })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Icon icon='tabler:calendar-time' />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
        </DatePickerWrapper>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button
            variant='contained'
            onClick={() => {
              handleGenerateShift()
              setShow(false)
            }}
          >
            <Translations text='Submit' />
          </Button>
        </DialogActions>
      </Dialog>
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
                <CardHeader title={t('ShiftInformation')} />
                <Divider />
                <CardContent>
                  <Grid container spacing={6}>
                    <Grid item xs={12} sm={6}>
                      <CustomTextField
                        fullWidth
                        label={t('ShiftName')}
                        value={formData.name}
                        onChange={e => handleFormChange('name', e.target.value)}
                        {...(errors && errors['name']
                          ? { error: true, helperText: errorTextHandler(errors['name']) }
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
                            label={is_secondary_school === false ? t('EduCenter') : t('School')}
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
                  title={t('CreatedShift')}
                  action={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: '15px'
                      }}
                    >
                      <Button
                        fullWidth
                        variant='tonal'
                        onClick={() => setShow(true)}
                        sx={{ px: 12, whiteSpace: 'nowrap' }}
                      >
                        <Translations text='AutoCreate' />
                      </Button>
                      <Button
                        variant='tonal'
                        color='success'
                        fullWidth
                        startIcon={<Icon icon='tabler:plus' />}
                        onClick={() => {
                          if (shiftTimes.length < 12) {
                            setShiftTimes(prev => [
                              ...prev,
                              [
                                ['', ''],
                                ['', ''],
                                ['', ''],
                                ['', ''],
                                ['', ''],
                                ['', '']
                              ]
                            ])
                            setGenerateShiftData({ ...generateShiftData, maxLessonsPerDay: shiftTimes.length + 1 })
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
                          if (shiftTimes.length > 1) {
                            setShiftTimes(prev => prev.slice(0, prev.length - 1))
                            setGenerateShiftData({ ...generateShiftData, maxLessonsPerDay: shiftTimes.length - 1 })
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
                    <Table sx={{ minWidth: 650 }} size='small' aria-label='simple table'>
                      <TableHead>
                        <TableRow>
                          <MUITableCell align='center'>
                            <Translations text='Tb' />
                          </MUITableCell>
                          <MUITableCell align='center'>
                            <FormControlLabel
                              label={<Translations text='Monday' />}
                              sx={{ '& svg': { height: 20, width: 20 } }}
                              control={
                                <Checkbox
                                  checked={enabledDays.includes(0)}
                                  onChange={e => {
                                    if (e.target.checked === true) {
                                      setEnabledDays(prev => [...prev, 0].sort())
                                    } else {
                                      setEnabledDays(prev => prev.filter(num => num !== 0))
                                    }
                                  }}
                                  name='monday'
                                />
                              }
                            />
                          </MUITableCell>
                          <MUITableCell align='center'>
                            <FormControlLabel
                              label={<Translations text='Tuesday' />}
                              sx={{ '& svg': { height: 20, width: 20 } }}
                              control={
                                <Checkbox
                                  checked={enabledDays.includes(1)}
                                  onChange={e => {
                                    if (e.target.checked === true) {
                                      setEnabledDays(prev => [...prev, 1].sort())
                                    } else {
                                      setEnabledDays(prev => prev.filter(num => num !== 1))
                                    }
                                  }}
                                  name='tuesday'
                                />
                              }
                            />
                          </MUITableCell>
                          <MUITableCell align='center'>
                            <FormControlLabel
                              label={<Translations text='Wednesday' />}
                              sx={{ '& svg': { height: 20, width: 20 } }}
                              control={
                                <Checkbox
                                  checked={enabledDays.includes(2)}
                                  onChange={e => {
                                    if (e.target.checked === true) {
                                      setEnabledDays(prev => [...prev, 2].sort())
                                    } else {
                                      setEnabledDays(prev => prev.filter(num => num !== 2))
                                    }
                                  }}
                                  name='wednesday'
                                />
                              }
                            />
                          </MUITableCell>
                          <MUITableCell align='center'>
                            <FormControlLabel
                              label={<Translations text='Thursday' />}
                              sx={{ '& svg': { height: 20, width: 20 } }}
                              control={
                                <Checkbox
                                  checked={enabledDays.includes(3)}
                                  onChange={e => {
                                    if (e.target.checked === true) {
                                      setEnabledDays(prev => [...prev, 3].sort())
                                    } else {
                                      setEnabledDays(prev => prev.filter(num => num !== 3))
                                    }
                                  }}
                                  name='thursday'
                                />
                              }
                            />
                          </MUITableCell>
                          <MUITableCell align='center'>
                            <FormControlLabel
                              label={<Translations text='Friday' />}
                              sx={{ '& svg': { height: 20, width: 20 } }}
                              control={
                                <Checkbox
                                  checked={enabledDays.includes(4)}
                                  onChange={e => {
                                    if (e.target.checked === true) {
                                      setEnabledDays(prev => [...prev, 4].sort())
                                    } else {
                                      setEnabledDays(prev => prev.filter(num => num !== 4))
                                    }
                                  }}
                                  name='friday'
                                />
                              }
                            />
                          </MUITableCell>
                          <MUITableCell align='center'>
                            <FormControlLabel
                              label={<Translations text='Saturday' />}
                              sx={{ '& svg': { height: 20, width: 20 } }}
                              control={
                                <Checkbox
                                  checked={enabledDays.includes(5)}
                                  onChange={e => {
                                    if (e.target.checked === true) {
                                      setEnabledDays(prev => [...prev, 5].sort())
                                    } else {
                                      setEnabledDays(prev => prev.filter(num => num !== 5))
                                    }
                                  }}
                                  name='saturday'
                                />
                              }
                            />
                          </MUITableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {shiftTimes?.map((row, rowIndex) => (
                          <TableRow
                            key={rowIndex}
                            sx={{
                              '&:last-of-type td, &:last-of-type th': {
                                borderBottom: 0
                              }
                            }}
                          >
                            <MUITableCell variant='head' align='center' scope='row'>
                              {rowIndex + 1} <Translations text='NLesson' />
                            </MUITableCell>
                            {row.map((date, innerIndex) => (
                              <MUITableCell key={innerIndex} variant='head' align='center'>
                                {date && date.length === 2 ? date[0] + ' - ' + date[1] : ''}
                              </MUITableCell>
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
              <Button variant='contained' sx={{ mr: 4 }} disabled={shift_add.loading} type='submit'>
                {shift_add.loading ? (
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
                disabled={shift_add.loading}
                onClick={() => {
                  onSubmit(null, formData, true)
                }}
              >
                {shift_add.loading ? (
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
    </>
  )
}

ShiftCreate.acl = {
  action: 'write',
  subject: 'admin_shifts'
}

export default ShiftCreate
