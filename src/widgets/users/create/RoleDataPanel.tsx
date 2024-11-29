import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  ListItemText,
  Theme,
  Typography,
  useMediaQuery
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import Translations from 'src/app/layouts/components/Translations'
import { ErrorKeyType } from 'src/entities/app/GeneralTypes'
import { SchoolDataType, UserRolesType } from 'src/entities/school/UserSchoolType'
import { UserCreateType } from 'src/entities/school/UserType'
import { RootState } from 'src/features/store'
import { errorTextHandler } from 'src/features/utils/api/errorHandler'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import Icon from 'src/shared/components/icon'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import CustomAvatar from 'src/shared/components/mui/avatar'
import CustomTextField from 'src/shared/components/mui/text-field'

type PropsType = {
  errors: ErrorKeyType
  imgSrc: string
  formData: UserCreateType
  userSchools: UserRolesType
  handleChangeTab: (val: string) => void
  handleUpdateUserSchools: (val: string | null, obj?: SchoolDataType) => void
  handleDeleteUserSchools: (obj?: any) => void
  handleUpdateUserSchoolClassroom: (obj?: any) => void
}

const RoleDataPanel = (props: PropsType) => {
  // ** State
  const errors = props.errors
  const imgSrc = props.imgSrc
  const formData = props.formData
  const userSchools = props.userSchools
  const handleChangeTab = props.handleChangeTab
  const handleUpdateUserSchools = props.handleUpdateUserSchools
  const handleDeleteUserSchools = props.handleDeleteUserSchools
  const handleUpdateUserSchoolClassroom = props.handleUpdateUserSchoolClassroom

  // ** Hooks
  const { t } = useTranslation()
  const isFixedWidth = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))
  const { region_lite_list } = useSelector((state: RootState) => state.regions)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card
          sx={{
            mx: 'auto',
            ...(isFixedWidth && {
              maxWidth: 600
            })
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CustomAvatar
                  src={imgSrc}
                  sx={{
                    width: 100,
                    height: 100,
                    marginRight: theme => theme.spacing(6),
                    borderRadius: theme => theme.shape.borderRadius + 'px!important'
                  }}
                  alt={t('UserAvatarAlt') as string}
                />
                <Box padding={4}>
                  <Typography display={'flex'} alignItems='center' sx={{ mb: 3, gap: 3, fontSize: 21 }}>
                    {renderUserFullname(formData.last_name, formData.first_name, formData.middle_name)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      {Object.entries(userSchools).length > 0 ? (
        Object.entries(userSchools).map(([key, value]) => (
          <Grid key={key} item xs={12} sm={12}>
            <Card
              sx={{
                mx: 'auto',
                ...(isFixedWidth && {
                  maxWidth: 600
                })
              }}
            >
              <CardHeader
                title={`${t(`Role${key[0].toUpperCase() + key.slice(1)}`)} ${
                  key === 'admin' ? `(${t('AllSchools')})` : ''
                } ${key === 'parent' ? `(${t('ByChildren')})` : ''}`}
                action={
                  key !== 'admin' && key !== 'parent' ? (
                    <Button
                      fullWidth
                      color='primary'
                      variant='tonal'
                      sx={{ minWidth: 190 }}
                      startIcon={<Icon icon='tabler:plus' />}
                      onClick={() => {
                        const schoolObj = { is_new: true, role: key, index: null, school: null }
                        handleUpdateUserSchools(null, schoolObj)
                      }}
                    >
                      <Translations text={key === 'organization' ? 'AddRegion' : 'AddSchool'} />
                    </Button>
                  ) : key === 'parent' ? (
                    <Typography
                      onClick={() => handleChangeTab('children')}
                      sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <Translations text='Children' />
                    </Typography>
                  ) : null
                }
              />
              {key !== 'admin' && key !== 'parent' && (
                <>
                  <Divider />
                  {value
                    .filter(obj => obj.is_delete !== true)
                    .map((item, index) => (
                      <Box key={index}>
                        <CardContent>
                          <Grid container spacing={5}>
                            {index !== 0 && (
                              <>
                                <Grid item xs={12}>
                                  <Box display='flex' alignItems='center' justifyContent='space-between'>
                                    <Typography>
                                      <Translations text={`Role${key[0].toUpperCase() + key.slice(1)}`} /> {index + 1}
                                    </Typography>
                                    <Button
                                      variant='tonal'
                                      color='error'
                                      size='medium'
                                      onClick={() => {
                                        handleDeleteUserSchools({
                                          index: index,
                                          role: key,
                                          ...(item?.is_old === true ? { is_delete: true } : null),
                                          school: item?.school
                                        })
                                      }}
                                      startIcon={<Icon icon='tabler:trash' fontSize={20} />}
                                    >
                                      <Translations text='Delete' />
                                    </Button>
                                  </Box>
                                  <Divider sx={{ mt: 3 }} />
                                </Grid>
                              </>
                            )}
                            <Grid item xs={12}>
                              <CustomAutocomplete
                                id='school'
                                value={item?.school}
                                disabled={item?.is_old === true}
                                options={key === 'organization' ? region_lite_list.data : schools_lite_list.data}
                                loading={key === 'organization' ? region_lite_list.loading : schools_lite_list.loading}
                                loadingText={t('ApiLoading')}
                                onChange={(e, v) => {
                                  const schoolObj = { is_new: false, role: key, index: index, school: v }
                                  handleUpdateUserSchools(null, schoolObj)
                                }}
                                noOptionsText={t('NoRows')}
                                renderOption={(props, item) => (
                                  <li {...props} key={item.key}>
                                    <ListItemText>{item.value}</ListItemText>
                                  </li>
                                )}
                                getOptionLabel={option => option.value || ''}
                                renderInput={params => (
                                  <CustomTextField
                                    {...params}
                                    {...(errors && errors[`${key}.school_id`]
                                      ? { error: true, helperText: errorTextHandler(errors[`${key}.school_id`]) }
                                      : null)}
                                    label={key === 'organization' ? t('Region') : t('School')}
                                  />
                                )}
                              />
                            </Grid>
                            {(key === 'student' || key === 'teacher') && (
                              <Grid item xs={12}>
                                <CustomAutocomplete
                                  id='classroom'
                                  value={item?.classroom}
                                  loading={classrooms_lite_list.loading}
                                  loadingText={t('ApiLoading')}
                                  options={item?.classroom_options || []}
                                  onChange={(e, v) => {
                                    const dataObj = {
                                      role: key,
                                      index: index,
                                      school: item?.school,
                                      classroom: v
                                    }
                                    handleUpdateUserSchoolClassroom(dataObj)
                                  }}
                                  noOptionsText={t('NoRows')}
                                  renderOption={(props, item) => (
                                    <li {...props} key={item.key}>
                                      <ListItemText>{item.value}</ListItemText>
                                    </li>
                                  )}
                                  getOptionLabel={option => option.value || ''}
                                  renderInput={params => (
                                    <CustomTextField
                                      {...params}
                                      {...(errors && errors['classroom_id']
                                        ? { error: true, helperText: errorTextHandler(errors['classroom_id']) }
                                        : null)}
                                      label={t('Classroom')}
                                    />
                                  )}
                                />
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                        {value.filter(obj => obj.is_delete !== true)?.length - 1 !== index && <Divider />}
                      </Box>
                    ))}
                </>
              )}
            </Card>
          </Grid>
        ))
      ) : (
        <Grid item xs={12} sm={12}>
          <Card
            sx={{
              mx: 'auto',
              ...(isFixedWidth && {
                maxWidth: 600
              })
            }}
          >
            <CardContent>
              <Box display='flex' alignItems='center' justifyContent='center' flexDirection='column' gap={4}>
                <CustomAvatar variant='rounded' skin='light' sx={{ width: 52, height: 52 }}>
                  <Icon icon='tabler:user-filled' fontSize='2rem' />
                </CustomAvatar>
                <Typography variant='h4' textAlign='center' fontWeight={600}>
                  <Translations text='SelectRole' />
                </Typography>
                <Typography variant='h6' textAlign='center'>
                  <Translations text='SelectRoleText' />
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}

export default RoleDataPanel
