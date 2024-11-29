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
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'

interface TableHeaderProps {
  hasBankTypeFilter: boolean
  bankType: string | null
  tariffType: string | null
  payer: LiteModelType | null
  school: LiteModelType | null
  handleBankTypeFilter: (val: string | null) => void
  handleTariffTypeFilter: (val: string | null) => void
  handleFilterPayer: (val: LiteModelType | null) => void
  handleFilterSchool: (val: LiteModelType | null) => void
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const {
    hasBankTypeFilter,
    bankType,
    tariffType,
    payer,
    school,
    handleBankTypeFilter,
    handleTariffTypeFilter,
    handleFilterPayer,
    handleFilterSchool
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
        {hasBankTypeFilter && (
          <Grid item xs={12} sm={12} md={6} lg={3}>
            <FormControl size='small' fullWidth>
              <InputLabel id='bank-type-filter-label'>
                <Translations text='Bank' />
              </InputLabel>
              <Select
                label={t('Bank')}
                value={bankType}
                {...(bankType !== '' && {
                  endAdornment: (
                    <IconButton
                      size='small'
                      color='default'
                      onClick={() => {
                        handleBankTypeFilter('')
                      }}
                      sx={{ color: 'text.secondary', position: 'absolute', right: theme => theme.spacing(6) }}
                    >
                      <Icon icon='tabler:x' fontSize='1.2rem' />
                    </IconButton>
                  )
                })}
                onChange={e => handleBankTypeFilter(e.target.value)}
                id='bank-type-filter'
                labelId='bank-type-filter-label'
              >
                <MenuItem value='halkbank'>Halkbank</MenuItem>
                <MenuItem value='rysgalbank'>Rysgalbank</MenuItem>
                <MenuItem value='senagatbank'>Senagatbank</MenuItem>
                <MenuItem value='tfeb'>TFEB</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12} sm={12} md={6} lg={3}>
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
        <Grid item xs={12} sm={12} md={6} lg={3}>
          <FormControl size='small' fullWidth>
            <InputLabel id='tariff-filter-label'>
              <Translations text='Tariff' />
            </InputLabel>
            <Select
              label={t('Tariff')}
              value={tariffType}
              {...(tariffType !== '' && {
                endAdornment: (
                  <IconButton
                    size='small'
                    color='default'
                    onClick={() => {
                      handleTariffTypeFilter('')
                    }}
                    sx={{ color: 'text.secondary', position: 'absolute', right: theme => theme.spacing(6) }}
                  >
                    <Icon icon='tabler:x' fontSize='1.2rem' />
                  </IconButton>
                )
              })}
              onChange={e => handleTariffTypeFilter(e.target.value)}
              id='tariff-filter'
              labelId='tariff-filter-label'
            >
              <MenuItem value='plus'>
                <Translations text='PlusTariff' />
              </MenuItem>
              <MenuItem value='trial'>
                <Translations text='TrialTariff' />
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={3}>
          <CustomAutocomplete
            fullWidth
            id='payer'
            size='small'
            value={payer}
            options={users_lite_list.data}
            loading={users_lite_list.loading}
            loadingText={t('ApiLoading')}
            onChange={(e: any, v: LiteModelType | null) => {
              handleFilterPayer(v)
            }}
            noOptionsText={t('NoRows')}
            renderOption={(props, item) => (
              <li {...props} key={item.key}>
                <ListItemText>{item.value}</ListItemText>
              </li>
            )}
            getOptionLabel={option => option.value || ''}
            renderInput={params => <TextField {...params} label={t('Payer')} />}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default TableHeader
