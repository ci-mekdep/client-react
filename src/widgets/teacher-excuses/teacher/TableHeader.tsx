// ** MUI Imports
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import { FormControl, Grid, InputLabel, Select, TextField } from '@mui/material'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Utils Import
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import { forwardRef } from 'react'
import format from 'date-fns/format'

interface TableHeaderProps {
  reason: string
  date: string | null
  handleFilterReason: (val: string) => void
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
  const { reason, date, handleFilterReason, handleFilterDate } = props

  const { t } = useTranslation()

  return (
    <Box
      sx={{
        p: 6,
        pb: 5
      }}
    >
      <Grid container spacing={6}>
        <Grid item xs={12} lg={6} md={6} sm={12}>
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
        <Grid item xs={12} lg={6} md={6} sm={12}>
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
                handleFilterDate(val)
              }}
            />
          </DatePickerWrapper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TableHeader
