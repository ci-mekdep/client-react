// ** Mui Imports
import { Box, Typography } from '@mui/material'
import Translations from 'src/app/layouts/components/Translations'

const NoRowsOverlay = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography>
        <Translations text='NoRows' />
      </Typography>
    </Box>
  )
}

export default NoRowsOverlay
