import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  styled
} from '@mui/material'
import format from 'date-fns/format'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { renderRole } from 'src/features/utils/ui/renderRole'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import Icon from 'src/shared/components/icon'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'
import {
  MRT_ColumnDef,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MaterialReactTable,
  useMaterialReactTable
} from 'material-react-table'
import { useDialog } from 'src/app/context/DialogContext'
import dataTableConfig from 'src/app/configs/dataTableConfig'

interface PropsType {
  pagination: any
  setPagination: (data: any) => void
  handleDeleteNotification: (id: string) => void
}

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  fontSize: theme.typography.body1.fontSize,
  color: `${theme.palette.primary.main} !important`
}))

const OutboxNotificationDetail = (props: PropsType) => {
  const [sorting, setSorting] = useState<MRT_SortingState>([])

  const deleteNotification = props.handleDeleteNotification
  const pagination = props.pagination
  const setPagination = props.setPagination
  const showDialog = useDialog()
  const { t } = useTranslation()
  const { outbox_detail, delete_notification } = useSelector((state: RootState) => state.outboxNotifications)

  const handleDownloadFile = (file: string) => {
    const link = document.createElement('a')
    link.href = file
    link.download = ''
    link.target = '_blank'
    link.click()
  }

  const handleShowDialog = async (id: string) => {
    const confirmed = await showDialog()
    if (confirmed) {
      deleteNotification(id)
    }
  }

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'user',
        accessorFn: row => row.user?.last_name,
        id: 'id',
        header: t('FullnameAndRole'),
        sortingFn: 'customSorting',
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip
              arrow
              placement='top'
              title={
                row.original.read_at !== '' && row.original.read_at !== null
                  ? `${t('UserReadNotificationAt')}: ${format(new Date(row.original.read_at), 'dd.MM.yyyy HH:mm ')}`
                  : t('UserNotReadNotification')
              }
            >
              <IconButton
                size='small'
                sx={{
                  mr: 1,
                  color: row.original.read_at !== '' && row.original.read_at !== null ? 'success.main' : 'error.main'
                }}
              >
                <Icon
                  icon={
                    row.original.read_at !== '' && row.original.read_at !== null
                      ? 'tabler:circle-check-filled'
                      : 'tabler:circle-x-filled'
                  }
                  fontSize={18}
                />
              </IconButton>
            </Tooltip>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                component={Link}
                href={`/users/view/${row.original.user?.id}`}
                color={'primary.main'}
                sx={{ textDecoration: 'none', fontWeight: 600 }}
              >
                {renderUserFullname(
                  row.original.user?.last_name,
                  row.original.user?.first_name,
                  row.original.user?.middle_name
                )}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                {renderRole(row.original.role as string)}
              </Typography>
            </Box>
          </Box>
        )
      },
      {
        accessorKey: 'comment',
        accessorFn: row => row.comment,
        id: 'username',
        header: t('Note'),
        Cell: ({ row }) => <Typography>{row.original.comment}</Typography>
      },
      {
        accessorKey: 'comment_files',
        accessorFn: row => row.comment_files && row.comment_files[0],
        id: 'files',
        header: t('Files'),
        Cell: ({ row }) => (
          <>
            {row.original.comment_files?.map((file: string, index: number) => (
              <Typography key={index} component={LinkStyled} href={file} download={true} marginRight={1}>
                <Translations text='File' /> {index + 1}
                {row.original.comment_files.length - 1 > index && ','}
              </Typography>
            ))}
          </>
        )
      }
    ],
    [t]
  )

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableStickyHeader: true,
    enableHiding: false,
    enableTopToolbar: false,
    enableRowActions: false,
    enableGlobalFilter: false,
    enableRowSelection: false,
    enableDensityToggle: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    isMultiSortEvent: () => true,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'none',
    muiTableBodyCellProps: {
      padding: 'none'
    },
    muiTablePaperProps: { sx: { boxShadow: 'none!important' } },
    muiTableContainerProps: { sx: { maxHeight: '80vh', border: 'none' } },
    muiSelectAllCheckboxProps: { sx: { padding: 0 } },
    muiSelectCheckboxProps: { sx: { padding: 0 } },
    muiPaginationProps: {
      color: 'primary',
      rowsPerPageOptions: [12, 24, 36],
      shape: 'rounded',
      variant: 'outlined',
      showFirstButton: false,
      showLastButton: false
    },
    columns,
    data:
      !outbox_detail.loading && outbox_detail.status === 'success' && outbox_detail.data.notification.items
        ? outbox_detail.data.notification.items
        : [],
    getRowId: row => (row.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: outbox_detail.error
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    renderTopToolbar: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'end',
          alignItems: 'center'
        }}
      >
        <MRT_ShowHideColumnsButton table={table} />
      </Box>
    ),
    rowCount: outbox_detail.data.total,
    initialState: {
      columnVisibility: {}
    },
    state: {
      density: 'compact',
      isLoading: outbox_detail.loading,
      pagination,
      sorting
    }
  })

  return (
    <>
      {!outbox_detail.loading && outbox_detail.data.notification && outbox_detail.status === 'success' ? (
        <>
          <Card sx={{ mb: 4 }}>
            <CardHeader
              title={outbox_detail.data.notification?.title}
              action={
                <Button
                  color='error'
                  variant='tonal'
                  onClick={() => {
                    handleShowDialog(outbox_detail.data.notification.id)
                  }}
                  disabled={delete_notification.loading}
                  startIcon={<Icon icon='tabler:trash' fontSize={20} />}
                >
                  {delete_notification.loading ? (
                    <CircularProgress
                      sx={{
                        width: '20px !important',
                        height: '20px !important',
                        mr: theme => theme.spacing(2)
                      }}
                    />
                  ) : null}
                  <Translations text='Delete' />
                </Button>
              }
            />
            <CardContent>
              <Box marginBottom={4}>
                <Typography mb={6}>{outbox_detail.data.notification?.content}</Typography>
                <Typography variant='body2' fontWeight={600} mb={2}>
                  {renderUserFullname(
                    outbox_detail.data.notification?.author.last_name,
                    outbox_detail.data.notification?.author.first_name,
                    outbox_detail.data.notification?.author.middle_name
                  )}{' '}
                  <Translations text='By' />
                </Typography>
                <Typography variant='body2' fontWeight={600} mb={6}>
                  {outbox_detail.data.notification?.created_at &&
                    format(new Date(outbox_detail.data.notification.created_at), 'dd.MM.yyyy HH:mm') + ' ugradyldy'}
                </Typography>
                {outbox_detail.data.notification.files.length > 0 && (
                  <Card>
                    <CardHeader
                      title={
                        <Typography variant='h6'>
                          <Translations text='SelectedFiles' />
                        </Typography>
                      }
                      sx={{ p: 3 }}
                    />
                    <Divider />
                    <CardContent sx={{ p: 3, pb: '0.75.rem!important' }}>
                      {outbox_detail.data.notification.files.map((file: string, index: number) => (
                        <Button
                          key={index}
                          variant='tonal'
                          color='success'
                          sx={{ mr: 4, mb: 2 }}
                          onClick={() => {
                            handleDownloadFile(file)
                          }}
                          startIcon={<Icon icon='tabler:download' fontSize={20} />}
                        >
                          {file.split('/')[file.split('/').length - 1]}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardHeader
              title={
                <Typography variant='h5'>
                  <Translations text='ReceivedUsers' />
                </Typography>
              }
              sx={{ p: 5 }}
            />
            <Divider />
            <CardContent sx={{ p: 0, pb: '0!important' }}>
              <MaterialReactTable table={table} />
            </CardContent>
          </Card>
        </>
      ) : Object.keys(outbox_detail.data).length === 0 ? null : (
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
      )}
    </>
  )
}

export default OutboxNotificationDetail
