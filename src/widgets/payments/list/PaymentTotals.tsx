import { useEffect, useState } from 'react'
import { Box, CircularProgress, Divider, Grid, styled, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'
import { PaymentTotalsType } from 'src/entities/app/PaymentType'
import Translations from 'src/app/layouts/components/Translations'

const Img = styled('img')(({}) => ({}))

const PaymentTotals = () => {
  const [totalAmounts, setTotalAmounts] = useState<PaymentTotalsType | null>(null)
  const [totalTransactions, setTotalTransactions] = useState<PaymentTotalsType | null>(null)
  const { payments_list } = useSelector((state: RootState) => state.payments)

  useEffect(() => {
    if (!payments_list.loading && payments_list.total_amount && payments_list.total_transactions) {
      setTotalAmounts(payments_list.total_amount)
      setTotalTransactions(payments_list.total_transactions)
    }
  }, [payments_list])

  if (!payments_list.loading && payments_list.data && totalAmounts && totalTransactions) {
    return (
      <Box
        position='relative'
        sx={{
          px: 6,
          py: 3
        }}
      >
        <Grid container spacing={6}>
          {totalAmounts.hasOwnProperty('halkbank') && totalTransactions.hasOwnProperty('halkbank') && (
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Box display='flex' flexDirection='row' alignItems='center' gap={3}>
                <Img width={60} alt='halkbank' src='/images/banks/halkbank.png' />
                <Box display='flex' flexDirection='column' justifyContent='start'>
                  <Typography variant='h5' fontWeight={600}>
                    Halkbank
                  </Typography>
                  <Typography>
                    <Translations text='Total' />: {totalTransactions['halkbank']}
                  </Typography>
                </Box>
                <Typography variant='h5' fontWeight={600}>
                  {totalAmounts['halkbank'] !== null ? Math.round(totalAmounts['halkbank']) : '-'} TMT
                </Typography>
              </Box>
            </Grid>
          )}

          <Divider
            orientation='vertical'
            variant='middle'
            flexItem
            sx={{ mt: '1.8rem!important', mr: '-1px', display: { xs: 'none', sm: 'block', md: 'block', lg: 'block' } }}
          />

          {totalAmounts.hasOwnProperty('rysgalbank') && totalTransactions.hasOwnProperty('rysgalbank') && (
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Box display='flex' flexDirection='row' alignItems='center' gap={3}>
                <Img width={60} alt='rysgalbank' src='/images/banks/rysgalbank.png' />
                <Box display='flex' flexDirection='column' justifyContent='start'>
                  <Typography variant='h5' fontWeight={600}>
                    Rysgalbank
                  </Typography>
                  <Typography>
                    <Translations text='Total' />: {totalTransactions['rysgalbank']}
                  </Typography>
                </Box>
                <Typography variant='h5' fontWeight={600}>
                  {totalAmounts['rysgalbank'] !== null ? Math.round(totalAmounts['rysgalbank']) : '-'} TMT
                </Typography>
              </Box>
            </Grid>
          )}

          <Divider
            orientation='vertical'
            variant='middle'
            flexItem
            sx={{ mt: '1.8rem!important', mr: '-1px', display: { xs: 'none', sm: 'none', md: 'none', lg: 'block' } }}
          />

          {totalAmounts.hasOwnProperty('senagatbank') && totalTransactions.hasOwnProperty('senagatbank') && (
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Box display='flex' flexDirection='row' alignItems='center' gap={3}>
                <Img width={60} alt='senagatbank' src='/images/banks/senagatbank.png' />
                <Box display='flex' flexDirection='column' justifyContent='start'>
                  <Typography variant='h5' fontWeight={600}>
                    Senagatbank
                  </Typography>
                  <Typography>
                    <Translations text='Total' />: {totalTransactions['senagatbank']}
                  </Typography>
                </Box>
                <Typography variant='h5' fontWeight={600}>
                  {totalAmounts['senagatbank'] !== null ? Math.round(totalAmounts['senagatbank']) : '-'} TMT
                </Typography>
              </Box>
            </Grid>
          )}

          <Divider
            orientation='vertical'
            variant='middle'
            flexItem
            sx={{ mt: '1.8rem!important', mr: '-1px', display: { xs: 'none', sm: 'block', md: 'block', lg: 'block' } }}
          />

          {totalAmounts.hasOwnProperty('tfeb') && totalTransactions.hasOwnProperty('tfeb') && (
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Box display='flex' flexDirection='row' alignItems='center' gap={3}>
                <Img width={60} alt='tfeb' src='/images/banks/tfeb.png' />
                <Box display='flex' flexDirection='column' justifyContent='start'>
                  <Typography variant='h5' fontWeight={600}>
                    TFEB
                  </Typography>
                  <Typography>
                    <Translations text='Total' />: {totalTransactions['tfeb']}
                  </Typography>
                </Box>
                <Typography variant='h5' fontWeight={600}>
                  {totalAmounts['tfeb'] !== null ? Math.round(totalAmounts['tfeb']) : '-'} TMT
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    )
  } else {
    return (
      <Box
        sx={{
          width: '100%',
          height: '9vh',
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

export default PaymentTotals
