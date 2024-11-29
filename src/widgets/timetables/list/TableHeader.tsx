// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'

// ** Custom Components Imports
import CustomChip from 'src/shared/components/mui/chip'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'

// ** Type Imports
import { ShiftListType } from 'src/entities/classroom/ShiftType'
import { useTranslation } from 'react-i18next'
import { useContext } from 'react'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { useAuth } from 'src/features/hooks/useAuth'
import { ListItemText } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'

interface TableHeaderProps {
  shiftsStore: ShiftListType[]
  shiftsQuery: ShiftListType[]
  handleFilterShift: (val: ShiftListType[]) => void
  classroomsStore: LiteModelType[]
  classroomsQuery: LiteModelType[]
  handleFilterClassroom: (val: LiteModelType[]) => void
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { shiftsStore, shiftsQuery, handleFilterShift, classroomsStore, classroomsQuery, handleFilterClassroom } = props

  const { t } = useTranslation()
  const { current_school } = useAuth()
  const ability = useContext(AbilityContext)
  const { shifts_list } = useSelector((state: RootState) => state.shifts)
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)

  if (current_school === null) return <></>

  return (
    <Box
      sx={{
        p: 6,
        pb: 5
      }}
    >
      <Grid container spacing={6}>
        {ability?.can('read', 'admin_classrooms') ? (
          <Grid item xs={12} lg={4} md={6} sm={12}>
            <CustomAutocomplete
              multiple
              fullWidth
              size='small'
              value={classroomsQuery}
              options={classroomsStore}
              loading={classrooms_lite_list.loading}
              loadingText={t('ApiLoading')}
              disableCloseOnSelect={true}
              isOptionEqualToValue={(option, value) => option.key === value.key}
              onChange={(e: any, v: LiteModelType[]) => {
                handleFilterClassroom(v)
              }}
              id='classrooms'
              noOptionsText={t('NoRows')}
              renderOption={(props, item) => (
                <li {...props} key={item.key}>
                  <ListItemText>{item.value}</ListItemText>
                </li>
              )}
              getOptionLabel={option => option.value || ''}
              renderInput={params => <TextField {...params} label={t('Classroom')} />}
              renderTags={(value: LiteModelType[], getTagProps) =>
                value.map((option: LiteModelType, index: number) => (
                  <CustomChip
                    rounded
                    skin='light'
                    color='primary'
                    sx={{ m: 0.5 }}
                    label={option.value}
                    {...(getTagProps({ index }) as {})}
                    key={index}
                  />
                ))
              }
            />
          </Grid>
        ) : null}
        {ability?.can('read', 'admin_shifts') ? (
          <Grid item xs={12} lg={4} md={6} sm={12}>
            <CustomAutocomplete
              multiple
              fullWidth
              size='small'
              value={shiftsQuery}
              options={shiftsStore}
              loading={shifts_list.loading}
              loadingText={t('ApiLoading')}
              disableCloseOnSelect={true}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(e: any, v: ShiftListType[]) => {
                handleFilterShift(v)
              }}
              id='shifts'
              noOptionsText={t('NoRows')}
              renderOption={(props, item) => (
                <li {...props} key={item.id}>
                  <ListItemText>{item.name}</ListItemText>
                </li>
              )}
              getOptionLabel={option => option.name || ''}
              renderInput={params => <TextField {...params} label={t('Shift')} />}
              renderTags={(value: ShiftListType[], getTagProps) =>
                value.map((option: ShiftListType, index: number) => (
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
        ) : null}
      </Grid>
    </Box>
  )
}

export default TableHeader
