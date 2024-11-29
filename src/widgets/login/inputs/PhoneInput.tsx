// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import CustomTextField from 'src/shared/components/mui/text-field'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'

// ** Hooks
import { userLogin } from 'src/features/store/apps/login'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import Translations from 'src/app/layouts/components/Translations'
import { SchoolListType } from 'src/entities/school/SchoolType'

type PropsType = {
  school: SchoolListType | null
  phone: string
  setPhone: any
  setStep: any
}

type LoginFormType = {
  login: string
  otp?: string
  school_id?: string | null
}

const PhoneInput = (props: PropsType) => {
  const { school, phone, setPhone, setStep } = props

  // ** Hooks
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { login } = useSelector((state: RootState) => state.login)

  const onSubmit = async (data: LoginFormType) => {
    await dispatch(userLogin(data))
      .unwrap()
      .then(() => {
        setStep('otp')
      })
      .catch(err => {
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  return (
    <form
      noValidate
      autoComplete='off'
      onSubmit={e => {
        e.preventDefault()
        onSubmit({ login: phone, school_id: school ? school.id : null })
      }}
    >
      <Box sx={{ mb: 2 }}>
        <CustomTextField
          fullWidth
          type='text'
          label={t('Phone')}
          value={phone}
          onChange={e => {
            const input = e.target.value
            if (!input || !isNaN((input as any) - parseFloat(input))) {
              setPhone(e.target.value)
            }
          }}
          inputProps={{ maxLength: 8 }}
          InputProps={{
            startAdornment: <InputAdornment position='start'>+993</InputAdornment>
          }}
        />
      </Box>
      <Box display='flex' gap={4}>
        <Button fullWidth color='secondary' variant='contained' onClick={() => setStep('school')} sx={{ my: 4 }}>
          <Translations text='GoBack' />
        </Button>
        <Button
          fullWidth
          type='submit'
          variant='contained'
          disabled={login.loading || phone?.length !== 8}
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
            <Translations text='Submit' />
          )}
        </Button>
      </Box>
    </form>
  )
}

export default PhoneInput
