// ** React Imports
import { ReactNode, useEffect, useState } from 'react'

// ** MUI Components
import { Box, Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material'

// ** Layout Import
import BlankLayout from 'src/shared/layouts/BlankLayout'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchSettingsPages } from 'src/features/store/apps/settings/pages'
import Error from 'src/widgets/general/Error'

const TermsPage = () => {
  const [terms, setTerms] = useState<any>(null)

  // ** Hooks
  const dispatch = useDispatch<AppDispatch>()
  const { pages } = useSelector((state: RootState) => state.settingsPages)

  useEffect(() => {
    dispatch(fetchSettingsPages())
  }, [dispatch])

  useEffect(() => {
    if (!pages.loading && pages.status === 'success') {
      setTerms(pages.data.rules)
    }
  }, [pages])

  if (pages.error) {
    return <Error error={pages.error} />
  }

  if (!pages.loading && pages.status === 'success' && terms) {
    return (
      <Box p={5} py={10} sx={{ backgroundColor: 'background.paper' }}>
        <Card sx={{ marginX: 'auto', maxWidth: 1000 }}>
          <CardContent>
            <Typography variant='h4' fontWeight={600} textAlign={'center'} mb={4}>
              {terms.title}
            </Typography>
            <Grid container spacing={6}>
              <Grid item xs={12} lg={12}>
                <Typography sx={{ whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{`${terms.content}`}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    )
  } else {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }
}

TermsPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

TermsPage.guestGuard = true

export default TermsPage
