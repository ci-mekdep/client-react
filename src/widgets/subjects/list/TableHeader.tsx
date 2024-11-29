// ** React Imports
import { ChangeEvent, useContext } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  ListItemText,
  Select,
  TextField
} from '@mui/material'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Custom Components Imports
import CustomChip from 'src/shared/components/mui/chip'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'

// ** Utils Import
import { convertLessonHours } from 'src/features/utils/convertLessonHours'

// ** Type Imports
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { SubjectSettingsType } from 'src/entities/classroom/SubjectType'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { useAuth } from 'src/features/hooks/useAuth'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'

interface TableHeaderProps {
  usersStore: LiteModelType[]
  classroomStore: LiteModelType[]
  settingsStore: any
  lessonHours: number[] | null
  handleFilterWeekHours: (val: string | null) => void
  teacherQuery: LiteModelType | null
  handleFilterTeacher: (val: LiteModelType | null) => void
  subjectsQuery: SubjectSettingsType[]
  handleFilterSubject: (val: SubjectSettingsType[]) => void
  classroomsQuery: LiteModelType[]
  handleFilterClassroom: (val: LiteModelType[]) => void
  isSecondTeacherQuery: boolean | undefined
  handleFilterSecondTeacher: (val: boolean) => void
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const {
    usersStore,
    classroomStore,
    settingsStore,
    lessonHours,
    handleFilterWeekHours,
    teacherQuery,
    handleFilterTeacher,
    subjectsQuery,
    handleFilterSubject,
    classroomsQuery,
    handleFilterClassroom,
    isSecondTeacherQuery,
    handleFilterSecondTeacher
  } = props

  const { t } = useTranslation()
  const { current_school } = useAuth()
  const ability = useContext(AbilityContext)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)

  return (
    <Box
      sx={{
        p: 6,
        pb: 5
      }}
    >
      <Grid container spacing={6}>
        {ability?.can('read', 'admin_users') ? (
          <>
            {current_school !== null && (
              <Grid item xs={12} lg={2.7} md={6} sm={12}>
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
            )}
          </>
        ) : null}
        {ability?.can('read', 'admin_classrooms') ? (
          <>
            {current_school !== null && (
              <Grid item xs={12} lg={2.7} md={6} sm={12}>
                <CustomAutocomplete
                  multiple
                  fullWidth
                  size='small'
                  disableCloseOnSelect={true}
                  value={classroomsQuery}
                  options={classroomStore}
                  loading={classrooms_lite_list.loading}
                  loadingText={t('ApiLoading')}
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
                  isOptionEqualToValue={(option, value) => option.key === value.key}
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
            )}
          </>
        ) : null}
        <Grid item xs={12} lg={2.7} md={6} sm={12}>
          <CustomAutocomplete
            multiple
            fullWidth
            size='small'
            value={subjectsQuery}
            disableCloseOnSelect={true}
            options={settingsStore.data.subject?.subjects ? settingsStore.data.subject.subjects : []}
            loadingText={t('ApiLoading')}
            loading={settingsStore.loading}
            onChange={(e: any, v: SubjectSettingsType[]) => {
              handleFilterSubject(v)
            }}
            id='subjects'
            noOptionsText={t('NoRows')}
            renderOption={(props, item) => (
              <li {...props} key={item.full_name}>
                <ListItemText>{item.full_name}</ListItemText>
              </li>
            )}
            getOptionLabel={option => option.full_name || ''}
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
        <Grid item xs={12} lg={2.7} md={6} sm={12}>
          <FormControl size='small' fullWidth>
            <InputLabel id='lesson-filter-label'>
              <Translations text='LessonHours' />
            </InputLabel>
            <Select
              label={t('LessonHours')}
              value={convertLessonHours(lessonHours)}
              {...(lessonHours !== null && {
                endAdornment: (
                  <IconButton
                    size='small'
                    color='default'
                    onClick={() => {
                      handleFilterWeekHours(null)
                    }}
                    sx={{ color: 'text.secondary', position: 'absolute', right: theme => theme.spacing(6) }}
                  >
                    <Icon icon='tabler:x' fontSize='1.2rem' />
                  </IconButton>
                )
              })}
              onChange={e => {
                handleFilterWeekHours(e.target.value)
              }}
              id='lesson-filter'
              labelId='lesson-filter-label'
            >
              <MenuItem value='1-1'>1</MenuItem>
              <MenuItem value='2-2'>2</MenuItem>
              <MenuItem value='3-3'>3</MenuItem>
              <MenuItem value='4-4'>4</MenuItem>
              <MenuItem value='5-5'>5</MenuItem>
              <MenuItem value='6-6'>6</MenuItem>
              <MenuItem value='6'>6+</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} lg={1.2} md={6} sm={12}>
          <FormControlLabel
            label={t('Excuse')}
            control={
              <Checkbox
                checked={isSecondTeacherQuery}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  handleFilterSecondTeacher(event.target.checked)
                }}
                name='is_second_teacher'
              />
            }
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default TableHeader
