// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Translations from 'src/app/layouts/components/Translations'

const DashboardDefault = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={4}>
        <Card sx={{ position: 'relative', height: '100%' }}>
          <CardContent>
            <Typography variant='h5' sx={{ mb: 4 }}>
              <Translations text='Welcome' />
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default DashboardDefault
