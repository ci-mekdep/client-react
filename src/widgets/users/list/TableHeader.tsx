// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { ButtonGroup, FormControl, Grid, InputLabel, ListItemText, Select, TextField } from '@mui/material'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Utils Import
import { convertLessonHours } from 'src/features/utils/convertLessonHours'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { SyntheticEvent, useContext } from 'react'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { useAuth } from 'src/features/hooks/useAuth'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'

const initialRoles = [
  {
    id: 1,
    name: 'admin',
    display_name: 'RoleAdmins'
  },
  {
    id: 2,
    name: 'organization',
    display_name: 'RoleOrganizations'
  },
  {
    id: 3,
    name: 'operator',
    display_name: 'RoleOperators'
  },
  {
    id: 4,
    name: 'principal',
    display_name: 'RolePrincipals'
  },
  {
    id: 5,
    name: 'teacher',
    display_name: 'RoleTeachers'
  },
  {
    id: 6,
    name: 'parent',
    display_name: 'RoleParents'
  },
  {
    id: 7,
    name: 'student',
    display_name: 'RoleStudents'
  }
]

interface TableHeaderProps {
  roles: string[]
  status: string
  parents: string | null
  students: string | null
  classrooms: LiteModelType[]
  lessonHours: number[] | null
  activeClassroom: LiteModelType | null
  handleRoleChange: (val: string[]) => void
  handleFilterStatus: (val: string | null) => void
  handleFilterParents: (val: string | null) => void
  handleFilterChildren: (val: string | null) => void
  handleFilterClassroom: (val: LiteModelType | null) => void
  handleFilterLessonHours: (val: string | null) => void
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const {
    roles,
    status,
    parents,
    students,
    classrooms,
    lessonHours,
    activeClassroom,
    handleRoleChange,
    handleFilterStatus,
    handleFilterParents,
    handleFilterChildren,
    handleFilterClassroom,
    handleFilterLessonHours
  } = props

  const { t } = useTranslation()
  const ability = useContext(AbilityContext)
  const { current_school, current_role } = useAuth()
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)

  const givenRoleObject = initialRoles.find((role: any) => role.name === current_role)
  const rolesArr = givenRoleObject
    ? initialRoles.filter((role: any) =>
        current_role === 'admin' || current_role === 'principal'
          ? role.id >= givenRoleObject.id
          : current_role === 'operator'
          ? role.id > 3
          : role.id > givenRoleObject.id
      )
    : initialRoles

  return (
    <Box
      sx={{
        p: 6,
        pb: 5
      }}
    >
      <Grid container spacing={6}>
        <Grid
          item
          xs={12}
          xl={current_role === 'admin' ? 12 : 4.7}
          lg={current_role === 'admin' ? 12 : 4.7}
          md={12}
          sm={12}
        >
          <ButtonGroup variant='outlined' fullWidth>
            {rolesArr.map((row, index) => (
              <Button
                key={index}
                onClick={() => {
                  if (roles.includes(row.name)) {
                    handleRoleChange([])
                  } else {
                    handleRoleChange([row.name])
                  }
                }}
                variant={roles.includes(row.name) ? 'contained' : 'outlined'}
              >
                <Translations text={row.display_name} />
              </Button>
            ))}
          </ButtonGroup>
        </Grid>
        <Grid item xs={12} xl={3} lg={3} md={3} sm={12}>
          <FormControl size='small' fullWidth>
            <InputLabel id='status-filter-label'>
              <Translations text='Status' />
            </InputLabel>
            <Select
              label={t('Status')}
              value={status}
              onChange={e => {
                handleFilterStatus(e.target.value)
              }}
              {...(status && {
                endAdornment: (
                  <IconButton
                    size='small'
                    color='default'
                    onClick={() => {
                      handleFilterStatus(null)
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
              id='status-filter'
              labelId='status-filter-label'
            >
              <MenuItem value='active'>
                <Translations text='StatusActive' />
              </MenuItem>
              <MenuItem value='wait'>
                <Translations text='StatusWaiting' />
              </MenuItem>
              <MenuItem value='blocked'>
                <Translations text='StatusBlocked' />
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {ability?.can('read', 'admin_classrooms') && current_school !== null && (
          <Grid item xs={12} xl={2.5} lg={2.5} md={3} sm={12}>
            <CustomAutocomplete
              id='classroom_id'
              size='small'
              value={activeClassroom}
              options={classrooms}
              loading={classrooms_lite_list.loading}
              loadingText={t('ApiLoading')}
              onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                handleFilterClassroom(newValue)
              }}
              noOptionsText={t('NoRows')}
              renderOption={(props, item) => (
                <li {...props} key={item.key}>
                  <ListItemText>{item.value}</ListItemText>
                </li>
              )}
              getOptionLabel={option => option.value || ''}
              renderInput={params => <TextField {...params} label={t('Classroom')} />}
            />
          </Grid>
        )}
        <Grid item xs={12} xl={3} lg={3} md={3} sm={12}>
          {roles.includes('teacher') ? (
            <FormControl size='small' fullWidth>
              <InputLabel id='lesson-filter-label'>
                <Translations text='SubjectHours' />
              </InputLabel>
              <Select
                label={t('SubjectHours')}
                value={convertLessonHours(lessonHours)}
                {...(lessonHours !== null &&
                  lessonHours?.length !== 0 && {
                    endAdornment: (
                      <IconButton
                        size='small'
                        color='default'
                        onClick={() => {
                          handleFilterLessonHours(null)
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
                  handleFilterLessonHours(e.target.value)
                }}
                id='lesson-filter'
                labelId='lesson-filter-label'
              >
                <MenuItem value='1-11'>1-11</MenuItem>
                <MenuItem value='12-23'>12-23</MenuItem>
                <MenuItem value='24-35'>24-35</MenuItem>
                <MenuItem value='36'>36+</MenuItem>
              </Select>
            </FormControl>
          ) : roles.includes('parentt') ? (
            <FormControl size='small' fullWidth>
              <InputLabel id='children-filter-label'>
                <Translations text='ChildrenCount' />
              </InputLabel>
              <Select
                label={t('ChildrenCount')}
                displayEmpty
                value={students}
                {...(students !== '' && {
                  endAdornment: (
                    <IconButton
                      size='small'
                      color='default'
                      onClick={() => {
                        handleFilterChildren('')
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
                  handleFilterChildren(e.target.value)
                }}
                id='children-filter'
                labelId='children-filter-label'
              >
                <MenuItem value='0'>0</MenuItem>
                <MenuItem value='1'>1</MenuItem>
                <MenuItem value='2'>2</MenuItem>
                <MenuItem value='3'>3</MenuItem>
                <MenuItem value='4'>4</MenuItem>
                <MenuItem value='5'>5+</MenuItem>
              </Select>
            </FormControl>
          ) : roles.includes('student') ? (
            <FormControl size='small' fullWidth>
              <InputLabel id='parent-filter-label'>
                <Translations text='ParentCount' />
              </InputLabel>
              <Select
                label={t('ParentCount')}
                value={parents}
                {...(parents !== '' && {
                  endAdornment: (
                    <IconButton
                      size='small'
                      color='default'
                      onClick={() => {
                        handleFilterParents('')
                      }}
                      sx={{ color: 'text.secondary', position: 'absolute', right: theme => theme.spacing(6) }}
                    >
                      <Icon icon='tabler:x' fontSize='1.2rem' />
                    </IconButton>
                  )
                })}
                onChange={e => {
                  handleFilterParents(e.target.value)
                }}
                id='parent-filter'
                labelId='parent-filter-label'
              >
                <MenuItem value='0'>0</MenuItem>
                <MenuItem value='1'>1</MenuItem>
                <MenuItem value='2'>2</MenuItem>
                <MenuItem value='3'>2+</MenuItem>
              </Select>
            </FormControl>
          ) : (
            ''
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default TableHeader
