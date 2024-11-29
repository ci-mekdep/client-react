// ** MUI Imports
import Box from '@mui/material/Box'
import { FormControl, Grid, IconButton, InputLabel, MenuItem, Select } from '@mui/material'

// ** Utils Import
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import Icon from 'src/shared/components/icon'
import { convertLessonHours } from 'src/features/utils/convertLessonHours'

interface TableHeaderProps {
  examsCount: number[] | null
  handleFilterExamsCount: (val: string | null) => void
}

const ClassroomsTableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { examsCount, handleFilterExamsCount } = props

  const { t } = useTranslation()

  return (
    <Box
      sx={{
        p: 6,
        pb: 5
      }}
    >
      <Grid container spacing={6}>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <FormControl size='small' fullWidth>
            <InputLabel id='exam-filter-label'>
              <Translations text='ExamsCount' />
            </InputLabel>
            <Select
              label={t('ExamsCount')}
              value={convertLessonHours(examsCount)}
              {...(examsCount !== null &&
                examsCount?.length !== 0 && {
                  endAdornment: (
                    <IconButton
                      size='small'
                      color='default'
                      onClick={() => {
                        handleFilterExamsCount(null)
                      }}
                      onMouseDown={event => {
                        event.stopPropagation()
                      }}
                      sx={{ color: 'text.secondary', position: 'absolute', right: theme => theme.spacing(6) }}
                    >
                      <Icon icon='tabler:x' fontSize='1.2rem' />
                    </IconButton>
                  )
                })}
              onChange={e => {
                handleFilterExamsCount(e.target.value)
              }}
              id='exam-filter'
              labelId='exam-filter-label'
            >
              <MenuItem value='0-0'>0</MenuItem>
              <MenuItem value='1-1'>1</MenuItem>
              <MenuItem value='2-2'>2</MenuItem>
              <MenuItem value='3-4'>3-4</MenuItem>
              <MenuItem value='5'>5+</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ClassroomsTableHeader
