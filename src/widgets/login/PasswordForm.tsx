// ** React Imports
import { SyntheticEvent, useEffect, useState } from 'react'

// ** MUI Components
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'

// ** Custom Component Import
import Translations from 'src/app/layouts/components/Translations'
import CustomTextField from 'src/shared/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Hooks
import { RootState } from 'src/features/store'
import { useAuth } from 'src/features/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import useFcmToken from 'src/features/utils/hooks/useFcmToken'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { ApiInstanceType } from 'src/entities/app/AppSettingsType'
import { ListItemText } from '@mui/material'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'

const defaultValues = {
  login: '',
  password: ''
}

interface FormData {
  login: string
  password: string
}

const defaultVelayat = {
  code: 'beta',
  name: 'Başga serwer',
  url: ''
}

const PasswordForm = () => {
  const [welayat, setWelayat] = useState<ApiInstanceType | null>(null)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  // ** Hooks
  const auth = useAuth()
  const { t } = useTranslation()
  const { fcmToken } = useFcmToken()
  const { login } = useSelector((state: RootState) => state.login)
  const { settings } = useSelector((state: RootState) => state.settings)
  const thisDomain = process.env.NEXT_PUBLIC_DOMAIN

  useEffect(() => {
    if (!settings.loading && settings.data && settings.data?.general?.api_instances) {
      const currentWelayat =
        settings.data?.general?.api_instances?.find((item: any) => item.url === thisDomain) || defaultVelayat
      if (currentWelayat) {
        setWelayat(currentWelayat)
      }
    }
  }, [settings, thisDomain])

  const schema = yup.object().shape({
    login: yup.string().required(t('LoginPageLoginRequired') as string),
    password: yup
      .string()
      .min(8, t('LoginPagePasswordMin') as string)
      .required(t('LoginPagePasswordRequired') as string)
  })

  const onSubmit = async (data: FormData) => {
    const { login, password } = data
    const roles_priority = ['admin', 'organization', 'principal', 'operator', 'teacher', 'parent', 'student']
    await auth.handleLogin({ login, password, roles_priority, device_token: fcmToken }, err => {
      toast.error(errorHandler(err), { duration: 2000 })
      const errorObj = err.errors && err.errors[0]
      if (errorObj.code && errorObj.key) {
        if (errorObj.code === 'invalid' && errorObj.key === 'password') {
          setError('password', {
            type: 'manual',
            message: t('LoginPageInvalidPassword') as string
          })
        } else if (errorObj.code === 'not_exists') {
          setError('login', {
            type: 'manual',
            message: t('LoginPageUserNotFound') as string
          })
        } else if (errorObj.code === 'exceeded') {
          setError('password', {
            type: 'manual',
            message: t('ApiErrorExceeded') as string
          })
        } else {
          setError('login', {
            type: 'manual',
            message: t('ApiErrorDefault') as string
          })
        }
      } else {
        setError('login', {
          type: 'manual',
          message: t('ApiErrorDefault') as string
        })
      }
    })
  }

  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  return (
    <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ mb: 4 }}>
        <CustomAutocomplete
          id='welayat_id'
          value={welayat}
          options={settings.data?.general?.api_instances ? settings.data?.general.api_instances : []}
          loading={settings.loading}
          loadingText={t('ApiLoading')}
          onChange={(event: SyntheticEvent, newValue: ApiInstanceType | null) => {
            if (newValue && newValue?.url !== thisDomain) {
              window.open(newValue.url, '_blank')
            } else {
              setWelayat(newValue)
            }
          }}
          noOptionsText={t('NoRows')}
          renderOption={(props, item) => (
            <li {...props} key={item.code}>
              <ListItemText>{item.name}</ListItemText>
            </li>
          )}
          getOptionLabel={option => option.name || ''}
          renderInput={params => <CustomTextField {...params} label={t('SelectVelayat')} />}
        />
      </Box>
      <Box sx={{ mb: 4 }}>
        <Controller
          name='login'
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange, onBlur } }) => (
            <CustomTextField
              id='login-input'
              data-cy='login-input'
              fullWidth
              label={t('LoginPageUsernameInputLabel')}
              value={value}
              onBlur={onBlur}
              onChange={onChange}
              error={Boolean(errors.login)}
              inputProps={{
                autocomplete: 'off'
              }}
              {...(errors.login && { helperText: errors.login.message })}
            />
          )}
        />
      </Box>
      <Box sx={{ mb: 1.5 }}>
        <Controller
          name='password'
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange, onBlur } }) => (
            <CustomTextField
              id='password-input'
              data-cy='password-input'
              fullWidth
              value={value}
              onBlur={onBlur}
              label={t('LoginPagePasswordInputLabel')}
              onChange={onChange}
              error={Boolean(errors.password)}
              {...(errors.password && { helperText: errors.password.message })}
              type={showPassword ? 'text' : 'password'}
              inputProps={{
                autocomplete: 'new-password'
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Icon fontSize='1.25rem' icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          )}
        />
      </Box>
      <Button data-cy='submit-btn' fullWidth type='submit' variant='contained' disabled={login.loading} sx={{ mt: 4 }}>
        {login.loading ? (
          <CircularProgress
            sx={{
              width: '20px !important',
              height: '20px !important'
            }}
          />
        ) : (
          <Translations text='LoginPageLogin' />
        )}
      </Button>
    </form>
  )
}

export default PasswordForm
