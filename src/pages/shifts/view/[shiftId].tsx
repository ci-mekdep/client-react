// ** React Imports
import { useEffect, useContext } from 'react'

// ** Next Import
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import { Box, CircularProgress, styled } from '@mui/material'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell, { TableCellBaseProps } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

// ** Custom Components Import
import Icon from 'src/shared/components/icon'

// ** Types
import { ShiftType } from 'src/entities/classroom/ShiftType'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { deleteShift, getCurrentShift } from 'src/features/store/apps/shifts'
import { reverseArray } from 'src/features/utils/reverseArray'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { useDialog } from 'src/app/context/DialogContext'
import { useAuth } from 'src/features/hooks/useAuth'

const MUITableCell = styled(TableCell)<TableCellBaseProps>(({ theme }) => ({
  '&:not(:first-of-type)': {
    borderLeft: `1px solid ${theme.palette.divider}`
  }
}))

const ShiftView = () => {
  const router = useRouter()
  const id = router.query.shiftId
  const showDialog = useDialog()
  const { t } = useTranslation()
  const { is_secondary_school } = useAuth()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { shift_detail } = useSelector((state: RootState) => state.shifts)
  const data: ShiftType = shift_detail.data as ShiftType
  const shiftData: (string[] | null)[][] = data?.value && (reverseArray(data?.value) as (string[] | null)[][])

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentShift(id as string))
    }
  }, [dispatch, id])

  const handleShowDialog = async (id: string) => {
    const confirmed = await showDialog()
    if (confirmed && id) {
      handleDeleteShift(id)
    }
  }

  const handleDeleteShift = async (id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteShift([id]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        router.push('/shifts')
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  if (shift_detail.error) {
    return <Error error={shift_detail.error} />
  }

  if (!shift_detail.loading && id) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('ShiftInformation')}
              action={
                ability.can('write', 'admin_shifts') ? (
                  <Box display='flex' gap='15px'>
                    <Button
                      variant='tonal'
                      component={Link}
                      href={`/shifts/edit/${data.id}`}
                      startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                    >
                      <Translations text='Edit' />
                    </Button>
                    <Button
                      color='error'
                      variant='tonal'
                      onClick={() => {
                        handleShowDialog(id as string)
                      }}
                      startIcon={<Icon icon='tabler:trash' fontSize={20} />}
                    >
                      <Translations text='Delete' />
                    </Button>
                  </Box>
                ) : null
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='ShiftName' />
                  </Typography>
                  <Typography>{data.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='ClassroomsCount' />
                  </Typography>
                  <Typography>{data.classrooms_count}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='TimetablesCount' />
                  </Typography>
                  <Typography>{data.timetables_count}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={6} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text={is_secondary_school === false ? 'EduCenter' : 'School'} />
                  </Typography>
                  <Typography>
                    {data.school?.parent && `${data.school.parent.name}, `}
                    {data.school?.name}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('CreatedShift')} />
            <Divider />
            <CardContent sx={{ p: '0 !important' }}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} size='small' aria-label='simple table'>
                  <TableHead>
                    <TableRow>
                      <MUITableCell align='center'>
                        <Translations text='Tb' />
                      </MUITableCell>
                      <MUITableCell align='center'>
                        <Translations text='Monday' />
                      </MUITableCell>
                      <MUITableCell align='center'>
                        <Translations text='Tuesday' />
                      </MUITableCell>
                      <MUITableCell align='center'>
                        <Translations text='Wednesday' />
                      </MUITableCell>
                      <MUITableCell align='center'>
                        <Translations text='Thursday' />
                      </MUITableCell>
                      <MUITableCell align='center'>
                        <Translations text='Friday' />
                      </MUITableCell>
                      <MUITableCell align='center'>
                        <Translations text='Saturday' />
                      </MUITableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shiftData?.map((row, rowIndex) => (
                      <TableRow
                        key={rowIndex}
                        sx={{
                          '&:last-of-type td, &:last-of-type th': {
                            borderBottom: 0
                          }
                        }}
                      >
                        <MUITableCell variant='head' align='center' scope='row'>
                          {rowIndex + 1} <Translations text='NLesson' />
                        </MUITableCell>
                        {row?.map((date, innerIndex) => (
                          <MUITableCell key={innerIndex} variant='head' align='center'>
                            {date && date.length === 2 ? date[0] + ' - ' + date[1] : ''}
                          </MUITableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  } else {
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
        <CircularProgress />
      </Box>
    )
  }
}

ShiftView.acl = {
  action: 'read',
  subject: 'admin_shifts'
}

export default ShiftView
