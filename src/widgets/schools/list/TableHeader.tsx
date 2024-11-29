// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { ButtonGroup, Grid } from '@mui/material'

// ** Utils Import
import Translations from 'src/app/layouts/components/Translations'
import { useAuth } from 'src/features/hooks/useAuth'

interface TableHeaderProps {
  isSecondarySchool: boolean
  handleFilterSecondarySchool: (val: boolean) => void
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { isSecondarySchool, handleFilterSecondarySchool } = props

  const { current_role } = useAuth()

  return (
    <Box
      sx={{
        p: 6,
        pb: 5
      }}
    >
      <Grid container spacing={6}>
        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
          <ButtonGroup variant='outlined' fullWidth>
            {(current_role === 'admin' || current_role === 'organization' || current_role === 'operator') && (
              <>
                <Button
                  onClick={() => {
                    handleFilterSecondarySchool(true)
                  }}
                  variant={isSecondarySchool === true ? 'contained' : 'outlined'}
                >
                  <Translations text='Schools' />
                </Button>
                <Button
                  onClick={() => {
                    handleFilterSecondarySchool(false)
                  }}
                  variant={isSecondarySchool === false ? 'contained' : 'outlined'}
                >
                  <Translations text='EduCenters' />
                </Button>
              </>
            )}
          </ButtonGroup>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TableHeader
