// ** React Imports
import { SyntheticEvent, forwardRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { Grid, ListItemText, TextField } from '@mui/material'

import format from 'date-fns/format'
import DatePicker from 'react-datepicker'
import { useTranslation } from 'react-i18next'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'

// ** Icon Imports
import { DateType, LiteModelType } from 'src/entities/app/GeneralTypes'

// ** Utils Import
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { renderLogSubjectName } from 'src/features/utils/ui/renderLogSubjectName'
import { useAuth } from 'src/features/hooks/useAuth'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'

interface TableHeaderProps {
  ip: string
  userId?: string | null
  dateRange?: string[]
  actionName: string | null
  users: LiteModelType[]
  handleIp: (val: string) => void
  handleRange: (val: string[]) => void
  handleUserId: (val: string | null) => void
  handleActionName: (val: string) => void
}

interface PickerProps {
  label?: string
  end: Date | number
  start: Date | number
}

const CustomInput = forwardRef((props: PickerProps, ref) => {
  const startDate = props.start !== null ? format(props.start, 'dd.MM.yyyy') : ''
  const endDate = props.end !== null ? ` - ${props.end && format(props.end, 'dd.MM.yyyy')}` : null

  const value = `${startDate}${endDate !== null ? endDate : ''}`

  return <TextField size='small' fullWidth inputRef={ref} label={props.label || ''} {...props} value={value} />
})

const subject_names = [
  'users',
  'schools',
  'classrooms',
  'lessons',
  'grades',
  'absents',
  'timetables',
  'subjects',
  'shifts',
  'topics',
  'periods',
  'payments',
  'books',
  'base_subjects',
  'reports',
  'report_items'
]

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { ip, users, actionName, handleIp, handleRange, handleUserId, handleActionName } = props

  const [selectedUser, setSelectedUser] = useState<LiteModelType | null>(null)

  const [startDate, setStartDate] = useState<DateType | null>(null)
  const [endDate, setEndDate] = useState<DateType | null>(null)

  const handleOnChange = (dates: any) => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
    handleRange(dates.map((date: string | null) => date && format(new Date(date), 'yyyy-MM-dd')))
  }

  const { t } = useTranslation()
  const { current_school } = useAuth()
  const { users_lite_list } = useSelector((state: RootState) => state.user)

  return (
    <Box>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={12} md={6} lg={6} xl={3}>
          <TextField
            fullWidth
            label='IP'
            size='small'
            value={ip}
            placeholder={'1.1.1.1'}
            onChange={e => {
              handleIp(e.target.value)
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6} xl={3}>
          <DatePickerWrapper>
            <DatePicker
              locale='tm'
              id='date_range'
              autoComplete='off'
              selectsRange
              showYearDropdown
              showMonthDropdown
              endDate={endDate}
              selected={startDate}
              startDate={startDate}
              onChange={handleOnChange}
              shouldCloseOnSelect={false}
              calendarStartDay={1}
              customInput={
                <CustomInput
                  label={t('Date') as string}
                  start={startDate as Date | number}
                  end={endDate as Date | number}
                />
              }
            />
          </DatePickerWrapper>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6} xl={3}>
          <CustomAutocomplete
            id='subject_name'
            size='small'
            value={actionName}
            options={subject_names}
            onChange={(event: SyntheticEvent, newValue: string | null) => {
              if (newValue === null) {
                handleActionName('')
              } else {
                handleActionName(newValue)
              }
            }}
            noOptionsText={t('NoRows')}
            renderOption={(props, item) => (
              <li {...props} key={item}>
                <ListItemText>{renderLogSubjectName(item)}</ListItemText>
              </li>
            )}
            getOptionLabel={option => renderLogSubjectName(option) || ''}
            renderInput={params => <TextField {...params} label={t('UserAction')} />}
          />
        </Grid>
        {current_school !== null && (
          <Grid item xs={12} sm={12} md={6} lg={6} xl={3}>
            <CustomAutocomplete
              id='user_id'
              size='small'
              value={selectedUser}
              options={users}
              loading={users_lite_list.loading}
              loadingText={t('ApiLoading')}
              onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                setSelectedUser(newValue)
                handleUserId(newValue ? newValue.key : null)
              }}
              noOptionsText={t('NoRows')}
              renderOption={(props, item) => (
                <li {...props} key={item.key}>
                  <ListItemText>{item.value}</ListItemText>
                </li>
              )}
              getOptionLabel={option => option.value || ''}
              renderInput={params => <TextField {...params} label={t('User')} />}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default TableHeader
