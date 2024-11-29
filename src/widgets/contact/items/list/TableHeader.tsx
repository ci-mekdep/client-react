// ** MUI Imports
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import { Button, ButtonGroup, FormControl, Grid, InputLabel, ListItemText, Select, TextField } from '@mui/material'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Utils Import
import { useTranslation } from 'react-i18next'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import Translations from 'src/app/layouts/components/Translations'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'

const typesArr = [
  {
    id: 1,
    type: 'complaint',
    display_name: 'ContactTypeComplaint'
  },
  {
    id: 2,
    type: 'suggestion',
    display_name: 'ContactTypeSuggestion'
  },
  {
    id: 3,
    type: 'review',
    display_name: 'ContactTypeReview'
  },
  {
    id: 4,
    type: 'data_complaint',
    display_name: 'ContactTypeDataComplaint'
  }
]

interface TableHeaderProps {
  hasTypeQuery: boolean
  type: string | null
  status: string | null
  user: LiteModelType | null
  users: LiteModelType[]
  operator: LiteModelType | null
  operators: LiteModelType[]
  school: LiteModelType | null
  handleFilterUser: (val: LiteModelType | null) => void
  handleFilterOperator: (val: LiteModelType | null) => void
  handleFilterSchool: (val: LiteModelType | null) => void
  handleFilterType: (val: string | null) => void
  handleFilterStatus: (val: string | null) => void
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const {
    hasTypeQuery,
    type,
    status,
    user,
    users,
    operator,
    operators,
    school,
    handleFilterUser,
    handleFilterOperator,
    handleFilterSchool,
    handleFilterType,
    handleFilterStatus
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
        {hasTypeQuery && (
          <Grid item xs={12} lg={8} md={8} sm={12}>
            <ButtonGroup variant='outlined' fullWidth>
              {typesArr.map((row, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    if (type === row.type) {
                      handleFilterType('')
                    } else {
                      handleFilterType(row.type)
                    }
                  }}
                  variant={type === row.type ? 'contained' : 'outlined'}
                >
                  <Translations text={row.display_name} />
                </Button>
              ))}
            </ButtonGroup>
          </Grid>
        )}
        <Grid item xs={12} lg={hasTypeQuery ? 4 : 6} md={hasTypeQuery ? 4 : 6} sm={12}>
          <FormControl size='small' fullWidth>
            <InputLabel id='status-filter-label'>
              <Translations text='Status' />
            </InputLabel>
            <Select
              label={t('Status')}
              value={status}
              {...(status !== '' && {
                endAdornment: (
                  <IconButton
                    size='small'
                    color='default'
                    onClick={() => {
                      handleFilterStatus('')
                    }}
                    sx={{ color: 'text.secondary', position: 'absolute', right: theme => theme.spacing(6) }}
                  >
                    <Icon icon='tabler:x' fontSize='1.2rem' />
                  </IconButton>
                )
              })}
              onChange={e => handleFilterStatus(e.target.value)}
              id='status-filter'
              labelId='status-filter-label'
            >
              <MenuItem value='waiting'>
                <Translations text='ContactStatusWaiting' />
              </MenuItem>
              <MenuItem value='todo'>
                <Translations text='ContactStatusTodo' />
              </MenuItem>
              <MenuItem value='processing'>
                <Translations text='ContactStatusProcessing' />
              </MenuItem>
              <MenuItem value='done'>
                <Translations text='ContactStatusDone' />
              </MenuItem>
              <MenuItem value='backlog'>
                <Translations text='ContactStatusBacklog' />
              </MenuItem>
              <MenuItem value='rejected'>
                <Translations text='ContactStatusRejected' />
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} lg={4} md={4} sm={12}>
          <CustomAutocomplete
            fullWidth
            id='user'
            size='small'
            value={user}
            options={users}
            loading={users_lite_list.loading}
            loadingText={t('ApiLoading')}
            onChange={(e: any, v: LiteModelType | null) => {
              handleFilterUser(v)
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
        <Grid item xs={12} lg={4} md={4} sm={12}>
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
        <Grid item xs={12} lg={4} md={4} sm={12}>
          <CustomAutocomplete
            fullWidth
            id='operator'
            size='small'
            value={operator}
            options={operators}
            loading={users_lite_list.loading}
            loadingText={t('ApiLoading')}
            onChange={(e: any, v: LiteModelType | null) => {
              handleFilterOperator(v)
            }}
            noOptionsText={t('NoRows')}
            renderOption={(props, item) => (
              <li {...props} key={item.key}>
                <ListItemText>{item.value}</ListItemText>
              </li>
            )}
            getOptionLabel={option => option.value || ''}
            renderInput={params => <TextField {...params} label={t('UpdatedByOperator')} />}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default TableHeader
