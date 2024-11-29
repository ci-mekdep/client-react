// ** MUI Components
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/widgets/general/FooterIllustrationsV2'

// ** Styled Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxWidth: 750,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12),
  [theme.breakpoints.down(1540)]: {
    maxWidth: 580
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: 500
  }
}))

const LoginLeftIllustration = () => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        borderRadius: '20px',
        justifyContent: 'center',
        backgroundColor: 'customColors.bodyBg',
        margin: theme => theme.spacing(8, 0, 8, 8)
      }}
    >
      <LoginIllustration alt='login-illustration' src={`/images/pages/login-illustration.png`} />
      <FooterIllustrationsV2 />
    </Box>
  )
}

export default LoginLeftIllustration
