// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Imports

// ** Third party libraries
import { useTranslation } from 'react-i18next'

// ** Type Imports
import { AppSettingsSubjectType } from 'src/entities/app/AppSettingsType'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import {
  Box,
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
import Translations from 'src/app/layouts/components/Translations'

const MUITableCell = styled(TableCell)<TableCellBaseProps>(({ theme }) => ({
  borderBottom: 0,
  verticalAlign: 'top',
  paddingLeft: '0 !important',
  paddingRight: '0 !important',
  '&:not(:last-child)': {
    paddingRight: `${theme.spacing(2)} !important`
  }
}))

const SubjectSettingsTab = () => {
  const [data, setData] = useState<AppSettingsSubjectType | null>(null)

  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { settings } = useSelector((state: RootState) => state.settings)

  useEffect(() => {
    dispatch(fetchSettings({}))
  }, [dispatch])

  useEffect(() => {
    if (!settings.loading && settings.status === 'success' && settings.data) {
      setData(settings.data.subject)
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
            <CardHeader title={t('SubjectSettings')} />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableBody sx={{ '& .MuiTableCell-root': { py: theme => `${theme.spacing(2)} !important` } }}>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='TopicTags' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography>
                          <Box display='flex' flexDirection='column'>
                            {settings.data.subject?.topic_tags.map((tag, index) => (
                              <Typography key={index}>{tag}</Typography>
                            ))}
                          </Box>
                        </Typography>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='ClassroomGroupKeys' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography>
                          <Box display='flex' flexDirection='column'>
                            {settings.data.subject?.classroom_group_keys.map((key, index) => (
                              <Typography key={index}>{key}</Typography>
                            ))}
                          </Box>
                        </Typography>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='BaseSubjects' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography>
                          <Box display='flex' flexDirection='column'>
                            {settings.data.subject?.base_subjects.map((base_subject, index) => (
                              <Typography key={index}>{base_subject}</Typography>
                            ))}
                          </Box>
                        </Typography>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='Subjects' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography>
                          <Box display='flex' flexDirection='column'>
                            {settings.data.subject?.subjects.map((subject, index) => (
                              <Typography key={index}>{subject.full_name}</Typography>
                            ))}
                          </Box>
                        </Typography>
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

export default SubjectSettingsTab
