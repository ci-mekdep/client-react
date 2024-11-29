// ** MUI Imports
import { Alert } from '@mui/material'

// ** Store Imports
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'

const AlertWidget = () => {
  const { settings } = useSelector((state: RootState) => state.settings)

  return (
    <>
      {!settings.loading && settings.status === 'success' && settings.data.general.alert_message && (
        <Alert severity='warning' sx={{ mb: 3 }}>
          {settings.data.general.alert_message}
        </Alert>
      )}
    </>
  )
}

export default AlertWidget
