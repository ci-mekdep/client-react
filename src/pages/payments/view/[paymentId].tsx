// ** React Imports
import { useEffect, useMemo } from 'react'

// ** Next Import
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Import
import Icon from 'src/shared/components/icon'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import Translations from 'src/app/layouts/components/Translations'
import { Box, CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import { useTranslation } from 'react-i18next'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import format from 'date-fns/format'
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import { renderPhone } from 'src/features/utils/ui/renderPhone'
import { PaymentType } from 'src/entities/app/PaymentType'
import { getCurrentPayment } from 'src/features/store/apps/payments'
import { renderTariffType } from 'src/features/utils/ui/renderTariffType'
import { renderPaymentStatus } from 'src/features/utils/ui/renderPaymentStatus'
import { renderBankType } from 'src/features/utils/ui/renderBankType'
import { renderUsername } from 'src/features/utils/ui/renderUsername'
import { UserListType } from 'src/entities/school/UserType'
import CustomAvatar from 'src/shared/components/mui/avatar'
import { ThemeColor } from 'src/shared/layouts/types'
import { getInitials } from 'src/shared/utils/get-initials'

const statusColors: { [key: string]: any } = {
  processing: { color: 'secondary.main', icon: 'tabler:reload' },
  completed: { color: 'success.main', icon: 'tabler:circle-check-filled' },
  failed: { color: 'error.main', icon: 'tabler:circle-x-filled' }
}

// ** renders client column
const renderAvatar = (row: UserListType) => {
  if (row.avatar) {
    return <CustomAvatar src={row.avatar} sx={{ mr: 2.5, width: 28, height: 28 }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color={'primary' as ThemeColor}
        sx={{ mr: 2.5, width: 28, height: 28, fontWeight: 500, fontSize: theme => theme.typography.body2.fontSize }}
      >
        {getInitials(renderUserFullname(row.last_name, row.first_name, null) || 'Aman Amanow')}
      </CustomAvatar>
    )
  }
}

const PaymentView = () => {
  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const id = router.query.paymentId
  const dispatch = useDispatch<AppDispatch>()
  const { payment_detail } = useSelector((state: RootState) => state.payments)
  const data: PaymentType = { ...(payment_detail.data as PaymentType) }

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentPayment(id as string))
    }
  }, [dispatch, id])

  const columns = useMemo<MRT_ColumnDef<UserListType>[]>(
    () => [
      {
        accessorKey: 'name',
        accessorFn: row => row.last_name,
        id: 'name',
        header: t('Fullname'),
        sortingFn: 'customSorting',
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderAvatar(row.original)}
            <Typography sx={{ color: 'text.secondary', fontWeight: 600, mr: 2.5 }}>
              {renderUserFullname(row.original.last_name, row.original.first_name, row.original.middle_name)}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'username',
        accessorFn: row => row.username,
        id: 'username',
        header: t('Username'),
        sortingFn: 'customSorting',
        Cell: ({ row }) => <Typography>{renderUsername(row.original.username)}</Typography>
      },
      {
        accessorKey: 'phone',
        accessorFn: row => row.phone,
        id: 'phone',
        header: t('Phone'),
        Cell: ({ row }) => <Typography>{renderPhone(row.original.phone)}</Typography>
      },
      {
        accessorKey: 'birthday',
        accessorFn: row => row.birthday,
        id: 'birthday',
        header: t('Birthday'),
        Cell: ({ row }) => (
          <Typography>{row.original.birthday && format(new Date(row.original.birthday), 'dd.MM.yyyy')}</Typography>
        )
      }
    ],
    [t]
  )

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableRowNumbers: true,
    enableRowActions: true,
    enableStickyHeader: true,
    enableHiding: false,
    enablePagination: false,
    enableRowSelection: false,
    enableGlobalFilter: false,
    enableDensityToggle: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    renderTopToolbar: false,
    renderBottomToolbar: false,
    muiTableBodyCellProps: {
      padding: 'none',
      sx: {
        minHeight: 62,
        height: 62
      }
    },
    muiTablePaperProps: { sx: { boxShadow: 'none!important' } },
    muiBottomToolbarProps: { sx: { paddingLeft: 4 } },
    muiTableContainerProps: { sx: { maxHeight: 'none', border: 'none' } },
    columns,
    data: data?.students ? data.students : [],
    getRowId: row => (row?.id ? row.id : ''),
    renderBottomToolbarCustomActions: () => (
      <Typography sx={{ color: 'text.secondary' }}>
        <Translations text='Total' /> {data?.students?.length}.
      </Typography>
    ),
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/users/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
      </Box>
    ),
    rowCount: data?.students?.length,
    state: {
      density: 'compact'
    }
  })

  if (payment_detail.error) {
    return <Error error={payment_detail.error} />
  }

  if (!payment_detail.loading && id) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('PaymentInformation') as string} />
            <Divider />
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Payer' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/users/view/${data.payer?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {renderUserFullname(data.payer?.last_name, data.payer?.first_name, data.payer?.middle_name)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='School' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/schools/view/${data.school?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {data.school?.parent && `${data.school.parent.name}, `}
                    {data.school?.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Status' />
                  </Typography>
                  <Box
                    display='flex'
                    justifyContent='flex-start'
                    alignItems='center'
                    gap={2}
                    sx={{
                      color: data.status ? statusColors[data.status].color : 'text.primary',
                      '& svg': {
                        color: data.status ? statusColors[data.status].color : 'text.primary'
                      }
                    }}
                  >
                    <Icon icon={data.status ? statusColors[data.status].icon : ''} fontSize='1.25rem' />
                    <Typography alignItems='center' color='inherit'>
                      {renderPaymentStatus(data.status)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Amount' />
                  </Typography>
                  <Typography>{data.amount ? data.amount : '-'} TMT</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Tariff' />
                  </Typography>
                  <Typography>{renderTariffType(data.tariff_type)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='MonthCount' />
                  </Typography>
                  <Typography>
                    {data.month} <Translations text='month' />
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Children' />
                  </Typography>
                  <Typography>
                    {data.students?.length} <Translations text='children' />
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Bank' />
                  </Typography>
                  <Typography>{renderBankType(data.bank_type)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='CardNumber' />
                  </Typography>
                  <Typography>{data.card_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Note' />
                  </Typography>
                  <Typography>{data.comment}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='SentTime' />
                  </Typography>
                  <Typography>
                    {data.created_at ? format(new Date(data.created_at), 'dd.MM.yyyy HH:mm') : ''}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('Children') as string} />
            <Divider />
            <MaterialReactTable table={table} />
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

PaymentView.acl = {
  action: 'read',
  subject: 'admin_payments'
}

export default PaymentView
