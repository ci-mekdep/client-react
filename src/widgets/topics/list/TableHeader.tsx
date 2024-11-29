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
import { SubjectSettingsType } from 'src/entities/classroom/SubjectType'
import CustomChip from 'src/shared/components/mui/chip'
import Translations from 'src/app/layouts/components/Translations'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'

interface TableHeaderProps {
  level: string | null
  period: string | null
  subject: SubjectSettingsType | null
  subjects: SubjectSettingsType[]
  classyear: string | null
  handleFilterLevel: (val: string | null) => void
  handleFilterPeriod: (val: string | null) => void
  handleFilterSubject: (val: SubjectSettingsType | null) => void
  handleFilterClassyear: (val: string | null) => void
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const {
    level,
    period,
    subject,
    subjects,
    classyear,
    handleFilterLevel,
    handleFilterPeriod,
    handleFilterSubject,
    handleFilterClassyear
  } = props

  const { t } = useTranslation()
  const { settings } = useSelector((state: RootState) => state.settings)

  return (
    <Box
      sx={{
        p: 6,
        pb: 5
      }}
    >
      <Grid container spacing={6}>
        <Grid item xs={12} lg={3} md={6} sm={12}>
          <CustomAutocomplete
            fullWidth
            size='small'
            value={subject}
            disableCloseOnSelect={true}
            options={subjects ? subjects : []}
            loading={settings.loading}
            loadingText={t('ApiLoading')}
            onChange={(e: any, v: SubjectSettingsType | null) => {
              handleFilterSubject(v)
            }}
            id='subjects'
            noOptionsText={t('NoRows')}
            renderOption={(props, item) => (
              <li {...props} key={item.name}>
                <ListItemText>{item.name}</ListItemText>
              </li>
            )}
            getOptionLabel={option => option.name || ''}
            renderInput={params => <TextField {...params} label={t('Subject')} />}
            renderTags={(value: SubjectSettingsType[], getTagProps) =>
              value.map((option: SubjectSettingsType, index: number) => (
                <CustomChip
                  rounded
                  skin='light'
                  color='primary'
                  sx={{ m: 0.5 }}
                  label={option.name}
                  {...(getTagProps({ index }) as {})}
                  key={index}
                />
              ))
            }
          />
        </Grid>
        <Grid item xs={12} lg={3} md={6} sm={12}>
          <FormControl size='small' fullWidth>
            <InputLabel id='classyear-filter-label'>
              <Translations text='Classroom' />
            </InputLabel>
            <Select
              label={t('Classroom')}
              value={classyear}
              {...(classyear !== '' && {
                endAdornment: (
                  <IconButton
                    size='small'
                    color='default'
                    onClick={() => {
                      handleFilterClassyear('')
                    }}
                    sx={{ color: 'text.secondary', position: 'absolute', right: theme => theme.spacing(6) }}
                  >
                    <Icon icon='tabler:x' fontSize='1.2rem' />
                  </IconButton>
                )
              })}
              onChange={e => handleFilterClassyear(e.target.value)}
              id='classyear-filter'
              labelId='classyear-filter-label'
            >
              <MenuItem value='1'>1</MenuItem>
              <MenuItem value='2'>2</MenuItem>
              <MenuItem value='3'>3</MenuItem>
              <MenuItem value='4'>4</MenuItem>
              <MenuItem value='5'>5</MenuItem>
              <MenuItem value='6'>6</MenuItem>
              <MenuItem value='7'>7</MenuItem>
              <MenuItem value='8'>8</MenuItem>
              <MenuItem value='9'>9</MenuItem>
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='11'>11</MenuItem>
              <MenuItem value='12'>12</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} lg={3} md={6} sm={12}>
          <FormControl size='small' fullWidth>
            <InputLabel id='period-filter-label'>
              <Translations text='Quarter' />
            </InputLabel>
            <Select
              id='period-filter'
              defaultValue=''
              labelId='period-filter-label'
              label={t('Quarter')}
              value={period}
              onChange={e => handleFilterPeriod(e.target.value)}
              {...(period !== '' && {
                endAdornment: (
                  <IconButton
                    size='small'
                    color='default'
                    onClick={() => {
                      handleFilterPeriod('')
                    }}
                    sx={{ color: 'text.secondary', position: 'absolute', right: theme => theme.spacing(6) }}
                  >
                    <Icon icon='tabler:x' fontSize='1.2rem' />
                  </IconButton>
                )
              })}
            >
              <MenuItem value='1'>1</MenuItem>
              <MenuItem value='2'>2</MenuItem>
              <MenuItem value='3'>3</MenuItem>
              <MenuItem value='4'>4</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} lg={3} md={6} sm={12}>
          <FormControl size='small' fullWidth>
            <InputLabel id='level-filter-label'>
              <Translations text='Level' />
            </InputLabel>
            <Select
              label={t('Level')}
              value={level}
              {...(level !== '' && {
                endAdornment: (
                  <IconButton
                    size='small'
                    color='default'
                    onClick={() => {
                      handleFilterLevel('')
                    }}
                    sx={{ color: 'text.secondary', position: 'absolute', right: theme => theme.spacing(6) }}
                  >
                    <Icon icon='tabler:x' fontSize='1.2rem' />
                  </IconButton>
                )
              })}
              onChange={e => handleFilterLevel(e.target.value)}
              id='level-filter'
              labelId='level-filter-label'
            >
              <MenuItem value='Adaty'>
                <Translations text='SchoolLevelNormal' />
              </MenuItem>
              <MenuItem value='Ýörite'>
                <Translations text='SchoolLevelSpecial' />
              </MenuItem>
              <MenuItem value='Hünär'>
                <Translations text='SchoolLevelProfessional' />
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TableHeader
