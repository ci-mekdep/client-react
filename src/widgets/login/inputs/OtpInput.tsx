// ** React Imports
import { ChangeEvent, KeyboardEvent, useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'

// ** Third Party Imports
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'

// ** Hooks
import { useAuth } from 'src/features/hooks/useAuth'
import { Typography } from '@mui/material'
import Translations from 'src/app/layouts/components/Translations'
import { useTranslation } from 'react-i18next'
import { SchoolListType } from 'src/entities/school/SchoolType'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'

interface FormData {
  login: string
  otp: string
  school_id?: string | null
}

type PropsType = {
  school: SchoolListType | null
  phone: string
  setStep: any
}

const OtpInput = (props: PropsType) => {
  const { school, phone, setStep } = props
  const [error, setError] = useState<string | null>(null)
  const [otp, setOtp] = useState<string[]>(new Array(5).fill(''))

  // ** Hooks
  const { t } = useTranslation()
  const { handleLogin } = useAuth()
  const { login } = useSelector((state: RootState) => state.login)

  const onSubmit = async (data: FormData) => {
    const { login, otp } = data
    const roles_priority = ['admin', 'organization', 'principal', 'operator', 'teacher', 'parent', 'student']
    await handleLogin({ login, otp, school_id: school ? school.id : null, roles_priority }, err => {
      toast.error(errorHandler(err), { duration: 2000 })
      const errorObj = err.errors && err.errors[0]

      if (errorObj.code && errorObj.key) {
        if (errorObj.code === 'invalid' && errorObj.key === 'otp') {
          setError(t('LoginPageInvalidOtp'))
        } else if (errorObj.code === 'not_exists') {
          setError(t('LoginPageUserNotFound'))
        } else if (errorObj.code === 'exceeded') {
          setError(t('ApiErrorExceeded'))
        } else {
          setError(t('ApiErrorDefault'))
        }
      } else {
        setError(t('ApiErrorDefault'))
      }
    })
  }

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return
    const value = element.value.slice(-1)
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError(null)

    if (newOtp.length === 5 && newOtp.every(i => i !== '')) {
      onSubmit({ login: phone, otp: newOtp.join('') })
    }

    if (value !== '') {
      const nextSibling = document.getElementById(`otp-${index + 1}`)
      if (nextSibling !== null) {
        nextSibling.focus()
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '') {
      const prevSibling = document.getElementById(`otp-${index - 1}`)
      if (prevSibling !== null) {
        prevSibling.focus()
      }
    }
  }

  return (
    <form
      noValidate
      autoComplete='off'
      onSubmit={e => {
        e.preventDefault()
        onSubmit({ login: phone, otp: otp.join('') })
      }}
    >
      <Box display='flex' flexDirection='column' gap={3}>
        <Typography>
          <Translations text='EnterOtp' />
        </Typography>
        <Box display='flex' justifyContent='space-between'>
          {otp.map((data, index) => (
            <TextField
              key={index}
              autoFocus={index === 0 && true}
              id={`otp-${index}`}
              type='text'
              error={error !== null}
              inputProps={{ maxLength: 1, style: { textAlign: 'center', fontSize: '150%' } }}
              value={data}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target, index)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
              sx={{ width: '3.5rem', marginRight: 1 }}
            />
          ))}
        </Box>
        {error ? <Typography color='error'>{error}</Typography> : ''}
      </Box>
      <Box display='flex' gap={4}>
        <Button fullWidth color='secondary' variant='contained' onClick={() => setStep('phone')} sx={{ my: 4 }}>
          <Translations text='GoBack' />
        </Button>
        <Button
          fullWidth
          type='submit'
          variant='contained'
          disabled={login.loading || otp.some(i => i === '')}
          sx={{ my: 4 }}
        >
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
      </Box>
    </form>
  )
}

export default OtpInput
