// ** React Imports
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Imports

// ** Third party libraries

// ** Type Imports
import { AppSettingsUpdateType } from 'src/entities/app/AppSettingsType'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import {
  Box,
  Button,
  CardHeader,
  Checkbox,
  CircularProgress,
  InputAdornment,
  styled,
  Table,
  TableBody,
  TableCell,
  TableCellBaseProps,
  TableContainer,
  TableRow
} from '@mui/material'
import { fetchSettings, updateSettings } from 'src/features/store/apps/settings'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { convertSettingsData } from 'src/features/utils/api/convertSettingsData'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import CustomTextField from 'src/shared/components/mui/text-field'
import Link from 'next/link'
import format from 'date-fns/format'

const MUITableCell = styled(TableCell)<TableCellBaseProps>(({ theme }) => ({
  borderBottom: 0,
  verticalAlign: 'top',
  paddingLeft: '0 !important',
  paddingRight: '0 !important',
  '&:not(:last-child)': {
    paddingRight: `${theme.spacing(2)} !important`
  }
}))

const defaultValues: AppSettingsUpdateType = {
  alert_message: '',
  grade_update_minutes: 0,
  absent_update_minutes: 0,
  delayed_grade_update_hours: 0,
  timetable_update_week_available: false,
  is_archive: false
}

interface ProfileViewProps {
  handleChangeEdit: () => void
}

const GeneralSettingsEdit = (props: ProfileViewProps) => {
  const [formData, setFormData] = useState<AppSettingsUpdateType>(defaultValues)
  const [isThisWeek, setIsThisWeek] = useState<boolean>(false)
  const [isArchive, setIsArchive] = useState<boolean>(false)

  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { settings, settings_update } = useSelector((state: RootState) => state.settings)

  useEffect(() => {
    if (!settings.loading && settings.status === 'success' && settings.data.general) {
      const detailData: AppSettingsUpdateType = { ...(settings.data.general as any) }
      setFormData(convertSettingsData(detailData))
      if (detailData.is_archive !== null) {
        setIsArchive(detailData.is_archive)
      }
      if (detailData.timetable_update_week_available !== null) {
        setIsThisWeek(detailData.timetable_update_week_available)
      }
    }
  }, [settings])

  const handleFormChange = (
    field: keyof AppSettingsUpdateType,
    value: AppSettingsUpdateType[keyof AppSettingsUpdateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: AppSettingsUpdateType) => {
    event?.preventDefault()

    dispatch(updateSettings(data))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        dispatch(fetchSettings({}))
        props.handleChangeEdit()
      })
      .catch(err => {
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  if (settings.error) {
    return <Error error={settings.error} />
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={12}>
        <form
          autoComplete='off'
          onSubmit={e => {
            onSubmit(e, formData)
          }}
        >
          <Card>
            <CardHeader
              title={t('GeneralSettings')}
              action={
                <Box>
                  <Button variant='contained' sx={{ mr: 4 }} disabled={settings_update.loading} type='submit'>
                    {settings_update.loading ? (
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
                  <Button variant='tonal' color='secondary' onClick={() => props.handleChangeEdit()}>
                    <Translations text='GoBack' />
                  </Button>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableBody sx={{ '& .MuiTableCell-root': { py: theme => `${theme.spacing(2)} !important` } }}>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='ApiVersion' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography>{settings.data.general?.api_version}</Typography>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='MobileRequiredVersion' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography>{settings.data.general?.mobile_required_version}</Typography>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='AlertMessage' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <CustomTextField
                          fullWidth
                          value={formData.alert_message}
                          onChange={e => handleFormChange('alert_message', e.target.value)}
                        />
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='AbsentUpdateMinutes' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <CustomTextField
                          fullWidth
                          type='text'
                          InputProps={{
                            endAdornment: <InputAdornment position='end'>minut</InputAdornment>
                          }}
                          value={formData.absent_update_minutes}
                          onChange={e => {
                            const input = e.target.value
                            if (!input || !isNaN((input as any) - parseFloat(input))) {
                              handleFormChange(
                                'absent_update_minutes',
                                e.target.value === '' ? '' : Number(e.target.value)
                              )
                            }
                          }}
                        />
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='DelayedUpdateHours' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <CustomTextField
                          fullWidth
                          type='text'
                          InputProps={{
                            endAdornment: <InputAdornment position='end'>sagat</InputAdornment>
                          }}
                          value={formData.delayed_grade_update_hours}
                          onChange={e => {
                            const input = e.target.value
                            if (!input || !isNaN((input as any) - parseFloat(input))) {
                              handleFormChange(
                                'delayed_grade_update_hours',
                                e.target.value === '' ? '' : Number(e.target.value)
                              )
                            }
                          }}
                        />
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='GradeUpdateMinutes' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <CustomTextField
                          fullWidth
                          type='text'
                          InputProps={{
                            endAdornment: <InputAdornment position='end'>minut</InputAdornment>
                          }}
                          value={formData.grade_update_minutes}
                          onChange={e => {
                            const input = e.target.value
                            if (!input || !isNaN((input as any) - parseFloat(input))) {
                              handleFormChange(
                                'grade_update_minutes',
                                e.target.value === '' ? '' : Number(e.target.value)
                              )
                            }
                          }}
                        />
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='TimetableUpdateCurrentWeek' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Checkbox
                          checked={isThisWeek}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setIsThisWeek(event.target.checked)
                            handleFormChange('timetable_update_week_available', event.target.checked)
                          }}
                          name='timetable_update_week_available'
                        />
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='IsArchive' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Checkbox
                          checked={isArchive}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setIsArchive(event.target.checked)
                            handleFormChange('is_archive', event.target.checked)
                          }}
                          name='is_archive'
                        />
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='ApiInstances' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Box display='flex' flexDirection='column'>
                          {settings.data.general?.api_instances.map((instance, index) => (
                            <Typography
                              key={index}
                              target='_blank'
                              component={Link}
                              href={instance.url}
                              sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                            >
                              {instance.name}
                            </Typography>
                          ))}
                        </Box>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='BankTypes' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography>
                          <Box display='flex' flexDirection='column'>
                            {settings.data.general?.bank_types.map((bank, index) => (
                              <Typography key={index}>{bank}</Typography>
                            ))}
                          </Box>
                        </Typography>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='DefaultPeriod' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography>
                          <Translations text='CurrentPeriod' />: {settings.data.general?.default_period.current_number}
                        </Typography>
                        {settings.data.general?.default_period.value.map((row, index) => (
                          <Typography key={index}>
                            {index + 1}. {row[0]} - {row[1]}
                          </Typography>
                        ))}
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='Holidays' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Box display='flex' flexDirection='column'>
                          {settings.data.general?.holidays.map((holiday, index) => (
                            <Typography key={index}>
                              {holiday.name}: {holiday.start_date && format(new Date(holiday.start_date), 'dd.MM')} -{' '}
                              {holiday.end_date && format(new Date(holiday.end_date), 'dd.MM')}
                            </Typography>
                          ))}
                        </Box>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='BookCategories' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Box display='flex' flexDirection='column'>
                          {settings.data.general?.book_categories.map((category, index) => (
                            <Typography key={index}>{category}</Typography>
                          ))}
                        </Box>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='MenuApps' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Box display='flex' flexDirection='column'>
                          {settings.data.general?.menu_apps.map((app, index) => (
                            <Typography
                              key={index}
                              target='_blank'
                              component={Link}
                              href={app.link}
                              sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                            >
                              {app.title.tm}
                            </Typography>
                          ))}
                        </Box>
                      </MUITableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </form>
      </Grid>
    </Grid>
  )
}

export default GeneralSettingsEdit
