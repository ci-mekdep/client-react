// ** MUI Imports
import Box from '@mui/material/Box'
import { FormControl, Grid, IconButton, InputLabel, ListItemText, MenuItem, Select, TextField } from '@mui/material'

// ** Utils Import
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { useTranslation } from 'react-i18next'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { PeriodType } from 'src/entities/school/PeriodType'
import { ShiftListType } from 'src/entities/classroom/ShiftType'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'
import Translations from 'src/app/layouts/components/Translations'
import Icon from 'src/shared/components/icon'
import { convertLessonHours } from 'src/features/utils/convertLessonHours'

interface TableHeaderProps {
  periodsStore: PeriodType[]
  periodQuery: PeriodType | null
  handleFilterPeriod: (val: PeriodType | null) => void
  shiftsStore: ShiftListType[]
  shiftQuery: ShiftListType | null
  handleFilterShift: (val: ShiftListType | null) => void
  usersStore: LiteModelType[]
  teacherQuery: LiteModelType | null
  handleFilterTeacher: (val: LiteModelType | null) => void
  examsCount: number[] | null
  handleFilterExamsCount: (val: string | null) => void
}

const GroupsTableHeader = (props: TableHeaderProps) => {
  // ** Props
  const {
    periodsStore,
    periodQuery,
    handleFilterPeriod,
    shiftsStore,
    shiftQuery,
    handleFilterShift,
    usersStore,
    teacherQuery,
    handleFilterTeacher,
    examsCount,
    handleFilterExamsCount
  } = props

  const { periods_list } = useSelector((state: RootState) => state.periods)
  const { shifts_list } = useSelector((state: RootState) => state.shifts)
  const { users_lite_list } = useSelector((state: RootState) => state.user)

  const { t } = useTranslation()

  return (
    <Box
      sx={{
        p: 6,
        pb: 5
      }}
    >
      <Grid container spacing={6}>
        <Grid item xs={12} sm={12} md={6} lg={3}>
          <CustomAutocomplete
            fullWidth
            id='period'
            size='small'
            value={periodQuery}
            options={periodsStore}
            loading={periods_list.loading}
            loadingText={t('ApiLoading')}
            onChange={(e: any, v: PeriodType | null) => {
              handleFilterPeriod(v)
            }}
            noOptionsText={t('NoRows')}
            renderOption={(props, item) => (
              <li {...props} key={item.id}>
                <ListItemText>{item.title}</ListItemText>
              </li>
            )}
            getOptionLabel={option => option.title || ''}
            renderInput={params => <TextField {...params} label={t('Season')} />}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={3}>
          <CustomAutocomplete
            fullWidth
            id='shift'
            size='small'
            value={shiftQuery}
            options={shiftsStore}
            loading={shifts_list.loading}
            loadingText={t('ApiLoading')}
            onChange={(e: any, v: ShiftListType | null) => {
              handleFilterShift(v)
            }}
            noOptionsText={t('NoRows')}
            renderOption={(props, item) => (
              <li {...props} key={item.id}>
                <ListItemText>{item.name}</ListItemText>
              </li>
            )}
            getOptionLabel={option => option.name || ''}
            renderInput={params => <TextField {...params} label={t('Shift')} />}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={3}>
          <CustomAutocomplete
            fullWidth
            id='teacher'
            size='small'
            value={teacherQuery}
            options={usersStore}
            loading={users_lite_list.loading}
            loadingText={t('ApiLoading')}
            onChange={(e: any, v: LiteModelType | null) => {
              handleFilterTeacher(v)
            }}
            noOptionsText={t('NoRows')}
            renderOption={(props, item) => (
              <li {...props} key={item.key}>
                <ListItemText>{item.value}</ListItemText>
              </li>
            )}
            getOptionLabel={option => option.value || ''}
            renderInput={params => <TextField {...params} label={t('Teacher')} />}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={3}>
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

export default GroupsTableHeader
