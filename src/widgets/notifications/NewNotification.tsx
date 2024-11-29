import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  ListItemText,
  TextField,
  Typography,
  styled
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { NotificationCreateType } from 'src/entities/app/NotificationType'
import CustomChip from 'src/shared/components/mui/chip'
import CustomTextField from 'src/shared/components/mui/text-field'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { useAuth } from 'src/features/hooks/useAuth'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { createNewNotification } from 'src/features/store/apps/outboxNotifications'
import toast from 'react-hot-toast'
import Icon from 'src/shared/components/icon'
import Translations from 'src/app/layouts/components/Translations'
import { useSelector } from 'react-redux'
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'

const initialRoles = [
  {
    id: 1,
    name: 'admin',
    display_name: 'RoleAdmin'
  },
  {
    id: 2,
    name: 'organization',
    display_name: 'RoleOrganization'
  },
  {
    id: 3,
    name: 'principal',
    display_name: 'RolePrincipal'
  },
  {
    id: 4,
    name: 'teacher',
    display_name: 'RoleTeacher'
  },
  {
    id: 5,
    name: 'parent',
    display_name: 'RoleParent'
  },
  {
    id: 6,
    name: 'student',
    display_name: 'RoleStudent'
  }
]

const defaultValues: NotificationCreateType = {
  id: '',
  title: '',
  content: '',
  roles: [],
  user_ids: [],
  school_ids: [],
  files: [],
  files_delete: []
}

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    height: 40
  }
}))

interface PropsType {
  handleLoadNotifications: () => void
}

const NewNotification = (props: PropsType) => {
  const [roles, setRoles] = useState<any[]>([])
  const [schools, setSchools] = useState<LiteModelType[]>([])
  const [formData, setFormData] = useState<NotificationCreateType>(defaultValues)
  const [filesToSend, setFilesToSend] = useState<any[]>([])
  const [selectedRoles, setSelectedRoles] = useState<any[]>([])
  const [selectedSchools, setSelectedSchools] = useState<LiteModelType[]>([])
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { create_notification } = useSelector((state: RootState) => state.outboxNotifications)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  const { t } = useTranslation()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { current_role, current_school } = useAuth()
  const handleLoadNotifications = props.handleLoadNotifications

  useEffect(() => {
    if (ability.can('read', 'admin_schools')) {
      dispatch(
        fetchSchoolsLite({
          limit: 750,
          offset: 0,
          is_select: true
        })
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  useEffect(() => {
    if (!schools_lite_list.loading && schools_lite_list.status === 'success') {
      const allSchools = [{ key: '', value: 'Ählisi' }, ...schools_lite_list.data]
      setSchools(allSchools)
    }
  }, [schools_lite_list])

  useEffect(() => {
    const rolesData: any = initialRoles
    if (current_role === 'admin') {
      setRoles(rolesData)
    } else {
      const givenRoleObject = rolesData.find((role: any) => role.name === current_role)
      const filteredRoles = givenRoleObject ? rolesData.filter((role: any) => role.id > givenRoleObject.id) : rolesData
      setRoles(filteredRoles)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current_role])

  const handleFormChange = (
    field: keyof NotificationCreateType,
    value: NotificationCreateType[keyof NotificationCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleInputImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files !== null && Array.from(e.target.files)
    setFilesToSend([...filesToSend, ...(selectedFiles as File[])])
  }

  const handleDeleteFile = (file: File) => {
    const newFiles = filesToSend.filter(f => f.name !== file.name)
    setFilesToSend(newFiles)
  }

  const onSubmit = (data: NotificationCreateType) => {
    const formDataToSend = new FormData()
    if (data) {
      formDataToSend.append('title', data.title)
      formDataToSend.append('content', data.content)
      selectedRoles.map(role => {
        formDataToSend.append('roles[]', role.name)
      })
      if (ability.cannot('read', 'admin_schools') && current_school !== null) {
        formDataToSend.append('school_ids[]', current_school.id.toString())
      } else if (selectedSchools.some((school: LiteModelType) => school.key === '')) {
        schools.map(school => {
          formDataToSend.append('school_ids[]', school.key.toString())
        })
      } else {
        selectedSchools.map(school => {
          formDataToSend.append('school_ids[]', school.key.toString())
        })
      }
      filesToSend.map(fileToSend => {
        formDataToSend.append('files', fileToSend)
      })
    }

    dispatch(createNewNotification(formDataToSend))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        setSelectedRoles([])
        setSelectedSchools([])
        setFormData(defaultValues)
        setFilesToSend([])
        handleLoadNotifications()
      })
      .catch(err => {
        const errorObject: ErrorKeyType = {}
        err.errors?.map((err: ErrorModelType) => {
          if (err.key && err.code) {
            errorObject[err.key] = err.code
          }
        })
        setErrors(errorObject)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  return (
    <Card>
      <form
        autoComplete='off'
        onSubmit={e => {
          e.preventDefault()
          onSubmit(formData as NotificationCreateType)
        }}
      >
        <CardHeader title={t('SendNewNotification')} />
        <CardContent>
          <CustomTextField
            fullWidth
            sx={{ mb: 4 }}
            label={t('Name')}
            placeholder={t('Name') as string}
            onChange={e => handleFormChange('title', e.target.value)}
            {...(errors && errors['title'] ? { error: true, helperText: errorTextHandler(errors['title']) } : null)}
          />
          <CustomTextField
            fullWidth
            multiline
            minRows={6}
            label={t('Notification')}
            placeholder={t('Notification') as string}
            onChange={e => handleFormChange('content', e.target.value)}
            sx={{ mb: 4, '& .MuiInputBase-root.MuiFilledInput-root': { alignItems: 'baseline' } }}
            {...(errors && errors['content'] ? { error: true, helperText: errorTextHandler(errors['content']) } : null)}
          />
          {ability.can('read', 'admin_schools') && (
            <CustomAutocomplete
              multiple
              fullWidth
              disableCloseOnSelect={true}
              size='small'
              sx={{ mb: 4 }}
              value={selectedSchools}
              options={schools}
              loading={schools_lite_list.loading}
              loadingText={t('ApiLoading')}
              isOptionEqualToValue={(option, value) => option.key === value.key}
              onChange={(e: any, v: any) => {
                setSelectedSchools(v)
              }}
              id='school'
              noOptionsText={t('NoRows')}
              renderOption={(props, item) => (
                <li {...props} key={item.key}>
                  <ListItemText>{item.value}</ListItemText>
                </li>
              )}
              getOptionLabel={option => option.value || ''}
              renderInput={params => (
                <TextField
                  {...params}
                  label={t('School')}
                  {...(errors && errors['school_ids']
                    ? { error: true, helperText: errorTextHandler(errors['school_ids']) }
                    : null)}
                />
              )}
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
          )}
          <CustomAutocomplete
            multiple
            fullWidth
            sx={{ mb: 4 }}
            disableCloseOnSelect={true}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            size='small'
            value={selectedRoles}
            options={roles}
            onChange={(e: any, v: any) => {
              setSelectedRoles(v)
            }}
            id='role'
            noOptionsText={t('NoRows')}
            renderOption={(props, item) => (
              <li {...props} key={item.id}>
                <ListItemText>
                  <Translations text={item.display_name} />
                </ListItemText>
              </li>
            )}
            getOptionLabel={option => t(option.display_name) || ''}
            renderInput={params => (
              <TextField
                {...params}
                label={t('Role')}
                {...(errors && errors['roles'] ? { error: true, helperText: errorTextHandler(errors['roles']) } : null)}
              />
            )}
            renderTags={(value: any[], getTagProps) =>
              value.map((option: any, index: number) => (
                <CustomChip
                  rounded
                  skin='light'
                  color='primary'
                  sx={{ m: 0.5 }}
                  label={t(option.display_name)}
                  {...(getTagProps({ index }) as {})}
                  key={index}
                />
              ))
            }
          />
          <Card>
            <CardContent>
              {filesToSend.map((fileToSend, index) => (
                <Card key={index} sx={{ marginBottom: 4 }}>
                  <Box
                    display={'flex'}
                    flexDirection={'row'}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                    gap={4}
                    padding={3}
                  >
                    <Box display={'flex'} alignItems={'center'} gap={4}>
                      <Img
                        height={30}
                        alt='device-logo'
                        src={`/images/extensions/${fileToSend.name.split('.').pop()}.png`}
                        onError={(e: any) => (e.target.src = '/images/extensions/default.png')}
                      />
                      <Typography variant='h6' fontWeight={600}>
                        {fileToSend.name}
                      </Typography>
                    </Box>
                    <Box minWidth={20}>
                      <IconButton
                        size='small'
                        onClick={() => {
                          handleDeleteFile(fileToSend)
                        }}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Icon icon='tabler:trash' fontSize={22} />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              ))}
              <Button
                color='primary'
                component='label'
                variant='contained'
                htmlFor='upload-image'
                sx={{ mr: 4 }}
                startIcon={<Icon icon='tabler:upload' fontSize={20} />}
              >
                <Translations text='SelectFile' />
                <input hidden id='upload-image' type='file' multiple onChange={handleInputImageChange} />
              </Button>
            </CardContent>
          </Card>
        </CardContent>
        <CardActions sx={{ justifyContent: 'end' }}>
          <Button
            variant='contained'
            color='success'
            type='submit'
            sx={{ mr: 2 }}
            startIcon={<Icon icon='tabler:send' />}
            disabled={create_notification.loading}
          >
            {create_notification.loading ? (
              <CircularProgress
                sx={{
                  width: '20px !important',
                  height: '20px !important',
                  mr: theme => theme.spacing(2)
                }}
              />
            ) : null}
            <Translations text='SendNewNotification' />
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}

export default NewNotification
