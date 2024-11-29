// ** MUI Imports
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import { FormControl, Grid, InputLabel, ListItemText, Select, TextField } from '@mui/material'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Utils Import
import { useTranslation } from 'react-i18next'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import Translations from 'src/app/layouts/components/Translations'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import { forwardRef } from 'react'
import format from 'date-fns/format'

interface TableHeaderProps {
  reason: string
  school: LiteModelType | null
  teacher: LiteModelType | null
  date: string | null
  handleFilterReason: (val: string) => void
  handleFilterSchool: (val: LiteModelType | null) => void
  handleFilterTeacher: (val: LiteModelType | null) => void
  handleFilterDate: (val: string | null) => void
}

interface PickerProps {
  label?: string
  date: Date | number | null
}

const CustomInput = forwardRef((props: PickerProps, ref) => {
  const date = props.date !== null ? format(props.date, 'dd.MM.yyyy') : ''

  return <TextField size='small' fullWidth inputRef={ref} label={props.label || ''} {...props} value={date} />
})

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const {
    reason,
    school,
    teacher,
    date,
    handleFilterReason,
    handleFilterSchool,
    handleFilterTeacher,
    handleFilterDate
  } = props

  const { t } = useTranslation()
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)

  return (
    <Box
      sx={{
        p: 6,
        pb: 5
      }}
    >
      <Grid container spacing={6}>
        <Grid item xs={12} lg={3} md={3} sm={12}>
          <CustomAutocomplete
            fullWidth
            id='school'
            size='small'
            value={school}
            options={schools_lite_list.data}
            loading={schools_lite_list.loading}
            loadingText={t('ApiLoading')}
            onChange={(e: any, v: LiteModelType | null) => {
              handleFilterSchool(v)
            }}
            noOptionsText={t('NoRows')}
            renderOption={(props, item) => (
              <li {...props} key={item.key}>
                <ListItemText>{item.value}</ListItemText>
              </li>
            )}
            getOptionLabel={option => option.value || ''}
            renderInput={params => <TextField {...params} label={t('School')} />}
          />
        </Grid>
        <Grid item xs={12} lg={3} md={3} sm={12}>
          <CustomAutocomplete
            fullWidth
            id='teacher'
            size='small'
            value={teacher}
            options={users_lite_list.data}
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
        <Grid item xs={12} lg={3} md={3} sm={12}>
          <FormControl size='small' fullWidth>
            <InputLabel id='reason-filter-label'>
              <Translations text='Reason' />
            </InputLabel>
            <Select
              label={t('Reason')}
              value={reason}
              {...(reason !== '' && {
                endAdornment: (
                  <IconButton
                    size='small'
                    color='default'
                    onClick={() => {
                      handleFilterReason('')
                    }}
                    sx={{ color: 'text.secondary', position: 'absolute', right: theme => theme.spacing(6) }}
                  >
                    <Icon icon='tabler:x' fontSize='1.2rem' />
                  </IconButton>
                )
              })}
              onChange={e => handleFilterReason(e.target.value)}
              id='reason-filter'
              labelId='reason-filter-label'
            >
              <MenuItem value='excuse_vacation'>
                <Translations text='TeacherExcuseVacation' />
              </MenuItem>
              <MenuItem value='excuse_unpaid'>
                <Translations text='TeacherExcuseUnpaid' />
              </MenuItem>
              <MenuItem value='excuse_paid'>
                <Translations text='TeacherExcusePaid' />
              </MenuItem>
              <MenuItem value='excuse_business_trip'>
                <Translations text='TeacherExcuseBusiness' />
              </MenuItem>
              <MenuItem value='excuse_study_trip'>
                <Translations text='TeacherExcuseStudy' />
              </MenuItem>
              <MenuItem value='excuse_maternity'>
                <Translations text='TeacherExcuseMaternity' />
              </MenuItem>
              <MenuItem value='excuse_ill'>
                <Translations text='TeacherExcuseIll' />
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} lg={3} md={3} sm={12}>
          <DatePickerWrapper>
            <DatePicker
              id='date'
              locale='tm'
              autoComplete='off'
              selected={date ? new Date(date) : null}
              dateFormat='dd.MM.yyyy'
              showYearDropdown
              showMonthDropdown
              preventOpenOnFocus
              placeholderText={t('SelectDate') as string}
              customInput={<CustomInput label={t('Date') as string} date={date ? new Date(date) : null} />}
              calendarStartDay={1}
              shouldCloseOnSelect={false}
              onChange={(val: any) => {
                handleFilterDate(val ? format(new Date(val), 'yyyy-MM-dd') : null)
              }}
            />
          </DatePickerWrapper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TableHeader
