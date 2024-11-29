import { Alert, AlertTitle, Grid } from '@mui/material'
import Translations from 'src/app/layouts/components/Translations'

const SelectSchoolWidget = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Alert severity='warning'>
          <AlertTitle>
            <Translations text='SchoolNotSelected' />
          </AlertTitle>
          <strong>
            <Translations text='SelectSchool' />
          </strong>
        </Alert>
      </Grid>
    </Grid>
  )
}

export default SelectSchoolWidget
