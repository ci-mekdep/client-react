import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  MenuItem,
  Theme,
  Typography,
  useMediaQuery
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import CustomTextField from 'src/shared/components/mui/text-field'
import Translations from 'src/app/layouts/components/Translations'
import { UserCreateType } from 'src/entities/school/UserType'
import { useAuth } from 'src/features/hooks/useAuth'
import CustomAvatar from 'src/shared/components/mui/avatar'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { ErrorKeyType } from 'src/entities/app/GeneralTypes'
import { errorTextHandler } from 'src/features/utils/api/errorHandler'

type PropsType = {
  errors: ErrorKeyType
  imgSrc: string
  formData: UserCreateType
  handleFormChange: (field: any, val: any) => void
}

const PersonalDataPanel = (props: PropsType) => {
  const errors = props.errors
  const imgSrc = props.imgSrc
  const formData = props.formData
  const handleFormChange = props.handleFormChange

  // ** Hooks
  const { t } = useTranslation()
  const { is_secondary_school } = useAuth()
  const isFixedWidth = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

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
      <Grid item xs={12} sm={12}>
        <Card
          sx={{
            mx: 'auto',
            ...(isFixedWidth && {
              maxWidth: 600
            })
          }}
        >
          <CardHeader title={t('PersonalInformation')} />
          <Divider />
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <CustomTextField
                  select
                  required
                  fullWidth
                  defaultValue=''
                  label={t('Gender')}
                  SelectProps={{
                    value: formData.gender,
                    onChange: e => handleFormChange('gender', parseInt(e.target.value as string))
                  }}
                  {...(errors && errors['gender']
                    ? { error: true, helperText: errorTextHandler(errors['gender']) }
                    : null)}
                >
                  <MenuItem value='1'>
                    <Translations text='GenderMale' />
                  </MenuItem>
                  <MenuItem value='2'>
                    <Translations text='GenderFemale' />
                  </MenuItem>
                </CustomTextField>
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  type='email'
                  label={t('Email')}
                  value={formData.email}
                  placeholder=''
                  onChange={e => handleFormChange('email', e.target.value)}
                  {...(errors && errors['email']
                    ? { error: true, helperText: errorTextHandler(errors['email']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label={t('Address')}
                  placeholder=''
                  value={formData.address}
                  onChange={e => handleFormChange('address', e.target.value)}
                  {...(errors && errors['address']
                    ? { error: true, helperText: errorTextHandler(errors['address']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  select
                  fullWidth
                  label={t('District')}
                  SelectProps={{
                    value: formData.district,
                    onChange: e => handleFormChange('district', e.target.value as string)
                  }}
                  {...(errors && errors['district']
                    ? { error: true, helperText: errorTextHandler(errors['district']) }
                    : null)}
                >
                  <MenuItem value='Aşgabat'>
                    <Translations text='RegionsAG' />
                  </MenuItem>
                  <MenuItem value='Arkadag'>
                    <Translations text='RegionsAK' />
                  </MenuItem>
                  <MenuItem value='Ahal'>
                    <Translations text='RegionsAH' />
                  </MenuItem>
                  <MenuItem value='Balkan'>
                    <Translations text='RegionsBN' />
                  </MenuItem>
                  <MenuItem value='Daşoguz'>
                    <Translations text='RegionsDZ' />
                  </MenuItem>
                  <MenuItem value='Lebap'>
                    <Translations text='RegionsLB' />
                  </MenuItem>
                  <MenuItem value='Mary'>
                    <Translations text='RegionsMR' />
                  </MenuItem>
                </CustomTextField>
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label={t('WorkPlace')}
                  placeholder=''
                  value={formData.work_place}
                  onChange={e => handleFormChange('work_place', e.target.value)}
                  {...(errors && errors['work_place']
                    ? { error: true, helperText: errorTextHandler(errors['work_place']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label={t('WorkTitle')}
                  placeholder=''
                  value={formData.work_title}
                  onChange={e => handleFormChange('work_title', e.target.value)}
                  {...(errors && errors['work_title']
                    ? { error: true, helperText: errorTextHandler(errors['work_title']) }
                    : null)}
                />
              </Grid>
              {is_secondary_school === false && (
                <>
                  <Grid item xs={12}>
                    <CustomTextField
                      fullWidth
                      label={t('EducationTitle')}
                      placeholder=''
                      value={formData.education_title}
                      onChange={e => handleFormChange('education_title', e.target.value)}
                      {...(errors && errors['education_title']
                        ? { error: true, helperText: errorTextHandler(errors['education_title']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      fullWidth
                      label={t('EducationPlace')}
                      placeholder=''
                      value={formData.education_place}
                      onChange={e => handleFormChange('education_place', e.target.value)}
                      {...(errors && errors['education_place']
                        ? { error: true, helperText: errorTextHandler(errors['education_place']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      fullWidth
                      label={t('EducationGroup')}
                      placeholder=''
                      value={formData.education_group}
                      onChange={e => handleFormChange('education_group', e.target.value)}
                      {...(errors && errors['education_group']
                        ? { error: true, helperText: errorTextHandler(errors['education_group']) }
                        : null)}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label={t('Reference')}
                  placeholder=''
                  value={formData.reference}
                  onChange={e => handleFormChange('reference', e.target.value)}
                  {...(errors && errors['reference']
                    ? { error: true, helperText: errorTextHandler(errors['reference']) }
                    : null)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default PersonalDataPanel
