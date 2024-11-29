// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { Box, Checkbox, CircularProgress, FormControlLabel, MenuItem, Typography } from '@mui/material'

// ** Custom Component Import
import Translations from 'src/app/layouts/components/Translations'
import CustomTextField from 'src/shared/components/mui/text-field'

// ** Type Imports
import { ReportFormOptionScheme } from 'src/entities/journal/ReportType'

// ** Types
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import { useTranslation } from 'react-i18next'
import { fetchDataReports } from 'src/features/store/apps/tools/data'
import format from 'date-fns/format'

const renderInput = (option: ReportFormOptionScheme) => {
  switch (option.type) {
    case 'number':
      return (
        <CustomTextField
          disabled
          fullWidth
          name={option.key}
          type={option.type}
          label={option.title}
          value={option.value}
        />
      )
    case 'boolean':
      return (
        <FormControlLabel
          disabled
          name={option.key}
          label={option.title}
          control={<Checkbox disabled checked={option.value === '1'} />}
        />
      )
    case 'options':
      return (
        <CustomTextField
          select
          disabled
          fullWidth
          name={option.key}
          label={option.title}
          id={option.key}
          value={option.value}
        >
          {option.options &&
            option.options.map((o: string, index: number) => (
              <MenuItem key={index} value={o}>
                {o}
              </MenuItem>
            ))}
        </CustomTextField>
      )
    case 'string':
      return (
        <CustomTextField
          disabled
          fullWidth
          name={option.key}
          type={option.type}
          label={option.title}
          value={option.value}
        />
      )
    default:
      return
  }
}

const ReportForm = () => {
  // ** State
  const [settings, setSettings] = useState<ReportFormOptionScheme[] | null>(null)
  const [lastEdited, setLastEdited] = useState<string | null>(null)

  // ** Hooks
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { data_reports } = useSelector((state: RootState) => state.dataReports)

  useEffect(() => {
    dispatch(fetchDataReports())
  }, [dispatch])

  useEffect(() => {
    if (!data_reports.loading && data_reports.data && data_reports.status === 'success' && data_reports.data[0]) {
      setLastEdited(data_reports.data[0].updated_at)
      setSettings(data_reports.data[0].settings)
    }
  }, [data_reports])

  if (data_reports.error) {
    return <Error error={data_reports.error} />
  }

  return (
    <>
      {!data_reports.loading && settings ? (
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={t('SchoolInformation')}
                action={
                  lastEdited && (
                    <Typography>
                      <Translations text='LastEditedTime' />: {format(new Date(lastEdited), 'dd.MM.yyyy HH:mm')}
                    </Typography>
                  )
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={6}>
                  {settings.map((option: ReportFormOptionScheme, index: number) => (
                    <Grid key={index} item xs={12} sm={6}>
                      {renderInput(option)}
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
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
      )}
    </>
  )
}

ReportForm.acl = {
  action: 'read',
  subject: 'tool_reports'
}

export default ReportForm
