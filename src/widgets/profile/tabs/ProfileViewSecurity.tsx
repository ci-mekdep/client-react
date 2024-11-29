// ** React Imports
import { ChangeEvent, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import toast from 'react-hot-toast'
import Icon from 'src/shared/components/icon'

// ** Custom Component Import
import CustomTextField from 'src/shared/components/mui/text-field'

// ** Store Imports
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { updatePassword } from 'src/features/store/apps/profile'
import { SecurityType } from 'src/entities/app/ProfileTypes'
import { useAuth } from 'src/features/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { useSelector } from 'react-redux'

interface ValueState {
  old_password: string
  new_password: string
  confirmNewPassword: string
}

interface ShowState {
  showOldPassword: boolean
  showNewPassword: boolean
  showConfirmNewPassword: boolean
}

const ProfileViewSecurity = () => {
  const [show, setShow] = useState<ShowState>({
    showOldPassword: false,
    showNewPassword: false,
    showConfirmNewPassword: false
  })
  const [values, setValues] = useState<ValueState>({
    old_password: '',
    new_password: '',
    confirmNewPassword: ''
  })

  // ** Hooks
  const dispatch = useDispatch<AppDispatch>()
  const { removeData } = useAuth()
  const { t } = useTranslation()
  const { profile_password } = useSelector((state: RootState) => state.profile)

  const handlePasswordChange = (prop: keyof ValueState) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }
  const handleClickPassword = (prop: keyof ShowState) => {
    setShow({ ...show, [prop]: !show[prop] })
  }

  const onSubmit = (value: ValueState) => {
    if (value.new_password === value.old_password) {
      toast.error(t('SameAsOldValidate'), {
        duration: 2000
      })

      return
    }

    if (value.new_password !== value.confirmNewPassword) {
      toast.error(t('NotSameNewPasswordsValidate'), {
        duration: 2000
      })

      return
    }

    const dataToSend: SecurityType = {
      old_password: value.old_password,
      new_password: value.new_password
    }

    dispatch(updatePassword(dataToSend))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        removeData()
      })
      .catch(err => {
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <form
              autoComplete='off'
              onSubmit={e => {
                e.preventDefault()
                onSubmit(values)
              }}
            >
              <Grid container spacing={4}>
                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    fullWidth
                    label={t('Password')}
                    value={values.old_password}
                    id='old-password'
                    data-cy='old-password'
                    onChange={handlePasswordChange('old_password')}
                    type={show.showOldPassword ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            data-cy='old-password-toggler'
                            onClick={() => handleClickPassword('showOldPassword')}
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle password visibility'
                          >
                            <Icon fontSize='1.25rem' icon={show.showOldPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    fullWidth
                    label={t('NewPassword')}
                    value={values.new_password}
                    id='new-password'
                    data-cy='new-password'
                    onChange={handlePasswordChange('new_password')}
                    type={show.showNewPassword ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            data-cy='new-password-toggler'
                            onClick={() => handleClickPassword('showNewPassword')}
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle password visibility'
                          >
                            <Icon fontSize='1.25rem' icon={show.showNewPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    fullWidth
                    label={t('NewPasswordConfirm')}
                    value={values.confirmNewPassword}
                    id='confirm-new-password'
                    data-cy='confirm-new-password'
                    type={show.showConfirmNewPassword ? 'text' : 'password'}
                    onChange={handlePasswordChange('confirmNewPassword')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            data-cy='confirm-new-password-toggler'
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle password visibility'
                            onClick={() => handleClickPassword('showConfirmNewPassword')}
                          >
                            <Icon
                              fontSize='1.25rem'
                              icon={show.showConfirmNewPassword ? 'tabler:eye' : 'tabler:eye-off'}
                            />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} textAlign={'right'}>
                  <Button data-cy='submit-btn' type='submit' variant='contained' disabled={profile_password.loading}>
                    {profile_password.loading ? (
                      <CircularProgress
                        sx={{
                          width: '20px !important',
                          height: '20px !important',
                          mr: theme => theme.spacing(2)
                        }}
                      />
                    ) : null}
                    <Translations text='Save' />
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProfileViewSecurity
