import { Alert, AlertTitle, Grid } from '@mui/material'
import { useEffect } from 'react'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { useAuth } from 'src/features/hooks/useAuth'
import { errorHandler } from 'src/features/utils/api/errorHandler'

type Params = {
  error: ErrorType
}

const Error = (props: Params) => {
  const error = errorHandler(props.error)
  const { removeData } = useAuth()

  useEffect(() => {
    if (
      props.error.errors &&
      props.error.errors[0] &&
      props.error.errors[0].code &&
      props.error.errors[0].code === 'unauthorized'
    ) {
      removeData()
    }
  }, [props.error, removeData])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Alert severity='error'>
          <AlertTitle>
            <strong>{error}</strong>
          </AlertTitle>
        </Alert>
      </Grid>
    </Grid>
  )
}

export default Error
