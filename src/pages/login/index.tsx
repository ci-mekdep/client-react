// ** React Imports
import { ReactNode } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

// ** Layout Import
import BlankLayout from 'src/shared/layouts/BlankLayout'
import LoginLeftIllustration from 'src/widgets/login/LoginLeftIllustration'
import LoginRightForm from 'src/widgets/login/LoginRightForm'

const LoginPage = () => {
  // ** Hooks
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      {!hidden ? <LoginLeftIllustration /> : null}
      <LoginRightForm />
    </Box>
  )
}

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

LoginPage.guestGuard = true

export default LoginPage
