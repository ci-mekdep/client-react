// ** React Imports
import { useContext, useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Imports
import Icon from 'src/shared/components/icon'

// ** Third party libraries
import format from 'date-fns/format'

// ** Type Imports
import { AppSettingsGeneralType } from 'src/entities/app/AppSettingsType'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import {
  Box,
  Button,
  CardHeader,
  CircularProgress,
  styled,
  Table,
  TableBody,
  TableCell,
  TableCellBaseProps,
  TableContainer,
  TableRow
} from '@mui/material'
import { fetchSettings } from 'src/features/store/apps/settings'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import Translations from 'src/app/layouts/components/Translations'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { useAuth } from 'src/features/hooks/useAuth'

const MUITableCell = styled(TableCell)<TableCellBaseProps>(({ theme }) => ({
  borderBottom: 0,
  verticalAlign: 'top',
  paddingLeft: '0 !important',
  paddingRight: '0 !important',
  '&:not(:last-child)': {
    paddingRight: `${theme.spacing(2)} !important`
  }
}))

interface ProfileViewProps {
  handleChangeEdit: () => void
}

const GeneralSettingsTab = (props: ProfileViewProps) => {
  const [data, setData] = useState<AppSettingsGeneralType | null>(null)

  const { t } = useTranslation()
  const { current_school } = useAuth()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { settings } = useSelector((state: RootState) => state.settings)

  useEffect(() => {
    const params: any = {}
    if (current_school) {
      params['school_id'] = current_school.id
    }
    dispatch(fetchSettings(params))
  }, [dispatch, current_school])

  useEffect(() => {
    if (!settings.loading && settings.status === 'success' && settings.data) {
      setData(settings.data.general)
    }
  }, [settings])

  if (settings.error) {
    return <Error error={settings.error} />
  }

  if (!settings.loading && data) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('GeneralSettings')}
              action={
                ability.can('write', 'admin_settings') ? (
                  <Button
                    variant='tonal'
                    onClick={() => props.handleChangeEdit()}
                    startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                  >
                    <Translations text='Edit' />
                  </Button>
                ) : null
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
                        <Typography>{settings.data.general?.alert_message}</Typography>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='AbsentUpdateMinutes' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography>{settings.data.general?.absent_update_minutes}</Typography>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='DelayedUpdateHours' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography>{settings.data.general?.delayed_grade_update_hours}</Typography>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='GradeUpdateMinutes' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography>{settings.data.general?.grade_update_minutes}</Typography>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='TimetableUpdateCurrentWeek' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography>
                          {settings.data.general?.timetable_update_week_available === true ? (
                            <Translations text='Yes' />
                          ) : (
                            <Translations text='No' />
                          )}
                        </Typography>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='IsArchive' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography>
                          {settings.data.general?.is_archive === true ? (
                            <Translations text='Yes' />
                          ) : (
                            <Translations text='No' />
                          )}
                        </Typography>
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
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='UserDocuments' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Box display='flex' flexDirection='column'>
                          {settings.data.general?.user_document_keys?.map((key, index) => (
                            <Typography key={index}>
                              <Translations text={key} />
                            </Typography>
                          ))}
                        </Box>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='ContactPhones' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Box display='flex' flexDirection='column'>
                          {settings.data.general?.contact_messages?.contact_phones?.map((key, index) => (
                            <Typography key={index}>
                              {key.name}: {key.value}
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
        </Grid>
      </Grid>
    )
  } else {
    return (
      <Box
        sx={{
          width: '100%',
          height: '80vh',
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

export default GeneralSettingsTab
