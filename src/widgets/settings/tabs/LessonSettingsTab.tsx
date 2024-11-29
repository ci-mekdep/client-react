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
import { AppSettingsLessonType } from 'src/entities/app/AppSettingsType'

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

const LessonSettingsTab = () => {
  const [data, setData] = useState<AppSettingsLessonType | null>(null)

  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { settings } = useSelector((state: RootState) => state.settings)

  useEffect(() => {
    dispatch(fetchSettings({}))
  }, [dispatch])

  useEffect(() => {
    if (!settings.loading && settings.status === 'success' && settings.data) {
      setData(settings.data.lesson)
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
            <CardHeader title={t('LessonSettings')} />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableBody sx={{ '& .MuiTableCell-root': { py: theme => `${theme.spacing(2)} !important` } }}>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='GradeReasons' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        {settings.data.lesson?.grade_reasons.map((reason, index) => (
                          <Typography key={index}>{reason.name.tm}</Typography>
                        ))}
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='LessonTypes' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        {settings.data.lesson?.lesson_types.map((type, index) => (
                          <Typography key={index}>{type.name.tm}</Typography>
                        ))}
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography>
                          <Translations text='StudentComments' />
                        </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        {settings.data.lesson?.student_comments.map((comment, index) => (
                          <Box key={index}>
                            {comment.types.map((type, innerIndex) => (
                              <Box key={innerIndex}>
                                {type.comments.map((item, iIndex) => (
                                  <Typography key={iIndex}>
                                    {comment.name} - {type.type} - {item.tm}
                                  </Typography>
                                ))}
                              </Box>
                            ))}
                          </Box>
                        ))}
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

export default LessonSettingsTab
