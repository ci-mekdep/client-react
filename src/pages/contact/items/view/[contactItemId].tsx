// ** React Imports
import { useEffect, useContext, useState, FormEvent, SyntheticEvent, useMemo } from 'react'

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
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import Translations from 'src/app/layouts/components/Translations'
import {
  Box,
  ButtonGroup,
  CircularProgress,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip
} from '@mui/material'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import { useTranslation } from 'react-i18next'
import { ContactItemCreateType, ContactItemType } from 'src/entities/app/ContactItemsType'
import { fetchContactItems, getCurrentContactItem, updateContactItem } from 'src/features/store/apps/contactItems'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { renderContactItemType } from 'src/features/utils/ui/renderContactItemData'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import CustomTextField from 'src/shared/components/mui/text-field'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { fetchClassroomsLite } from 'src/features/store/apps/classrooms'
import { fetchUsersLite } from 'src/features/store/apps/user'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import format from 'date-fns/format'
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import { renderPhone } from 'src/features/utils/ui/renderPhone'

type DataParams = {
  limit?: number
  offset?: number
  role?: string
  classroom_id?: string
}

const defaultValues: ContactItemCreateType = {
  id: '',
  user_id: null,
  related_id: null,
  school_id: null,
  birth_cert_number: '',
  classroom_name: '',
  parent_phone: '',
  message: '',
  type: '',
  status: '',
  files: []
}

const ContactItemView = () => {
  const [formData, setFormData] = useState<ContactItemCreateType>(defaultValues)
  const [role, setRole] = useState<string>('')
  const [parent, setParent] = useState<ContactItemType | null>(null)
  const [user, setUser] = useState<LiteModelType | null>(null)
  const [status, setStatus] = useState<string>('')

  const router = useRouter()
  const id = router.query.contactItemId
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { contact_item_detail, contact_items_list, contact_item_update } = useSelector(
    (state: RootState) => state.contactItems
  )
  const data: ContactItemType = { ...(contact_item_detail.data as ContactItemType) }

  const { t } = useTranslation()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentContactItem(id as string))
    }
  }, [dispatch, id])

  useEffect(() => {
    dispatch(fetchContactItems({ limit: 500, offset: 0 }))
    dispatch(fetchClassroomsLite({ limit: 200, offset: 0 }))
  }, [dispatch])

  useEffect(() => {
    if (!contact_item_detail.loading && contact_item_detail.status === 'success' && contact_item_detail.data) {
      setFormData({ ...defaultValues, note: contact_item_detail.data?.note })
      setParent(contact_item_detail.data?.related)
      setStatus(contact_item_detail.data.status)
    }
  }, [contact_item_detail])

  const handleDownloadFile = (file: string) => {
    const link = document.createElement('a')
    link.href = file
    link.download = ''
    link.target = '_blank'
    link.click()
  }

  const handleRoleChange = (val: string) => {
    const newRole = val
    setRole(newRole)

    const reqParams: DataParams = { limit: 500, offset: 0, role: newRole }
    const classroomName = data.classroom_name?.replace(/\s+/g, '').toLowerCase()
    const isClassroomListReady = classroomName && !classrooms_lite_list.loading

    if (isClassroomListReady) {
      const foundClassroom = classrooms_lite_list.data.find(
        classroom => classroom.value.replace(/\s+/g, '').toLowerCase() === classroomName
      )

      if (foundClassroom) {
        reqParams.classroom_id = foundClassroom.key
      }
      dispatch(fetchUsersLite(reqParams))
    }
  }

  const handleChangeStatus = (e: SelectChangeEvent<string>) => {
    e?.preventDefault()
    setStatus(e.target.value)

    const formDataToSend = new FormData()

    if (data.status) {
      formDataToSend.append('status', e.target.value)
    }

    dispatch(updateContactItem({ data: formDataToSend, id: id as string }))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        dispatch(getCurrentContactItem(id as string))
      })
      .catch(err => {
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  const handleChangeChildrenStatus = (e: SelectChangeEvent<string>, item: ContactItemType) => {
    const toastId = toast.loading(t('ApiLoading'))
    const formDataToSend = new FormData()
    formDataToSend.append('status', e.target.value)

    dispatch(updateContactItem({ data: formDataToSend, id: item.id as string }))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        dispatch(getCurrentContactItem(id as string))
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  const handleFormChange = (
    field: keyof ContactItemCreateType,
    value: ContactItemCreateType[keyof ContactItemCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: ContactItemCreateType) => {
    event?.preventDefault()

    const formDataToSend = new FormData()

    if (data.note) {
      formDataToSend.append('note', data.note)
    }
    if (data.related_id) {
      formDataToSend.append('related_id', data.related_id)
    }

    dispatch(updateContactItem({ data: formDataToSend, id: id as string }))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        dispatch(getCurrentContactItem(id as string))
      })
      .catch(err => {
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  const columns = useMemo<MRT_ColumnDef<ContactItemType>[]>(
    () => [
      {
        accessorKey: 'message',
        accessorFn: row => row.message,
        id: 'message',
        header: t('Message'),
        Cell: ({ row }) => (
          <Tooltip
            title={row.original.message}
            componentsProps={{
              tooltip: {
                sx: {
                  whiteSpace: 'pre-wrap'
                }
              }
            }}
            arrow
            placement='top'
          >
            <Typography sx={{ whiteSpace: 'normal' }}>
              {row.original.message?.length > 40 ? `${row.original.message.slice(0, 40)}...` : row.original.message}
            </Typography>
          </Tooltip>
        )
      },
      {
        accessorKey: 'type',
        accessorFn: row => row.type,
        id: 'type',
        header: t('Type'),
        Cell: ({ row }) => (
          <Tooltip title={`${t('RelatedContactItems')}: ${row.original.related_children_count}`} arrow placement='top'>
            <Box>
              <Typography>{renderContactItemType(row.original.type)}</Typography>
            </Box>
          </Tooltip>
        )
      },
      {
        accessorKey: 'user',
        accessorFn: row => row.user?.last_name,
        id: 'user',
        header: t('User') + '/' + t('School'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              component={Link}
              href={`/users/view/${row.original.user?.id}`}
              color={'primary.main'}
              sx={{ fontWeight: '600', textDecoration: 'none' }}
            >
              {renderUserFullname(
                row.original.user?.last_name,
                row.original.user?.first_name,
                row.original.user?.middle_name
              )}
            </Typography>
            <Typography>
              {row.original.school?.parent && `${row.original.school.parent.name}, `}
              {row.original.school?.name}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'created_at',
        accessorFn: row => row.created_at,
        id: 'created_at',
        header: t('SentTime'),
        Cell: ({ row }) => (
          <Typography>
            {row.original.created_at && format(new Date(row.original.created_at), 'dd.MM.yyyy HH:mm')}
          </Typography>
        )
      },
      {
        accessorKey: 'status',
        accessorFn: row => row.status,
        id: 'status',
        header: t('Status'),
        Cell: ({ row }) => (
          <FormControl fullWidth size='small'>
            <InputLabel id='status-filter-label'>
              <Translations text='Status' />
            </InputLabel>
            <Select
              label={t('Status')}
              value={row.original.status}
              onChange={e => handleChangeChildrenStatus(e, row.original)}
              id='status-filter'
              labelId='status-filter-label'
              sx={{ minWidth: 140 }}
            >
              <MenuItem value='waiting'>
                <Translations text='ContactStatusWaiting' />
              </MenuItem>
              <MenuItem value='todo'>
                <Translations text='ContactStatusTodo' />
              </MenuItem>
              <MenuItem value='processing'>
                <Translations text='ContactStatusProcessing' />
              </MenuItem>
              <MenuItem value='done'>
                <Translations text='ContactStatusDone' />
              </MenuItem>
              <MenuItem value='backlog'>
                <Translations text='ContactStatusBacklog' />
              </MenuItem>
              <MenuItem value='rejected'>
                <Translations text='ContactStatusRejected' />
              </MenuItem>
            </Select>
          </FormControl>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    data: data?.related_children ? data.related_children : [],
    getRowId: row => (row?.id ? row.id : ''),
    renderBottomToolbarCustomActions: () => (
      <Typography sx={{ color: 'text.secondary' }}>
        <Translations text='Total' /> {data?.related_children_count}.
      </Typography>
    ),
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/contact/items/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
      </Box>
    ),
    rowCount: data?.related_children?.length,
    state: {
      density: 'compact'
    }
  })

  if (contact_item_detail.error) {
    return <Error error={contact_item_detail.error} />
  }

  if (!contact_item_detail.loading && id) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('ContactItemInformation') as string}
              action={
                ability.can('write', 'admin_contact_items') ? (
                  <Box display='flex' gap={5}>
                    <FormControl fullWidth size='small'>
                      <InputLabel id='status-filter-label'>
                        <Translations text='Status' />
                      </InputLabel>
                      <Select
                        label={t('Status')}
                        value={status}
                        onChange={handleChangeStatus}
                        id='status-filter'
                        labelId='status-filter-label'
                        sx={{ minWidth: 250 }}
                      >
                        <MenuItem value='waiting'>
                          <Translations text='ContactStatusWaiting' />
                        </MenuItem>
                        <MenuItem value='todo'>
                          <Translations text='ContactStatusTodo' />
                        </MenuItem>
                        <MenuItem value='processing'>
                          <Translations text='ContactStatusProcessing' />
                        </MenuItem>
                        <MenuItem value='done'>
                          <Translations text='ContactStatusDone' />
                        </MenuItem>
                        <MenuItem value='backlog'>
                          <Translations text='ContactStatusBacklog' />
                        </MenuItem>
                        <MenuItem value='rejected'>
                          <Translations text='ContactStatusRejected' />
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                ) : null
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Message' />
                  </Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{data.message}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='User' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/users/view/${data.user?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {renderUserFullname(data.user?.last_name, data.user?.first_name, data.user?.middle_name)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='School' />
                  </Typography>
                  <Typography>
                    {data.school?.parent && `${data.school.parent.name}, `}
                    {data.school?.full_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Type' />
                  </Typography>
                  <Typography>{renderContactItemType(data.type)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='BirthCertNumber' />
                  </Typography>
                  <Typography>{data.birth_cert_number}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Classroom' />
                  </Typography>
                  <Typography>{data.classroom_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='Phone' />
                  </Typography>
                  <Typography>{renderPhone(data.parent_phone)}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='SentTime' />
                  </Typography>
                  <Typography>{data.created_at && format(new Date(data.created_at), 'dd.MM.yyyy HH:mm')}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='RelatedContactItems' />
                  </Typography>
                  <Typography>{data.related_children_count}</Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={4} lg={4}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    <Translations text='UpdatedByOperator' />
                  </Typography>
                  <Typography
                    component={Link}
                    href={`/users/view/${data.updated_by?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {renderUserFullname(
                      data.updated_by?.last_name,
                      data.updated_by?.first_name,
                      data.updated_by?.middle_name
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardContent>
              <form
                autoComplete='off'
                onSubmit={e => {
                  onSubmit(e, formData)
                }}
              >
                <Grid container spacing={5}>
                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <CustomTextField
                      fullWidth
                      label={t('Note')}
                      value={formData.note}
                      onChange={e => handleFormChange('note', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <CustomAutocomplete
                      id='related_id'
                      value={parent}
                      options={contact_items_list.data}
                      loading={contact_items_list.loading}
                      loadingText={t('ApiLoading')}
                      onChange={(event: SyntheticEvent, newValue: ContactItemType | null) => {
                        setParent(newValue)
                        handleFormChange('related_id', newValue?.id)
                      }}
                      noOptionsText={t('NoRows')}
                      renderOption={(props, item) => (
                        <li {...props} key={item.id}>
                          <ListItemText>{item.message}</ListItemText>
                        </li>
                      )}
                      getOptionLabel={option => option.message || ''}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          inputProps={{ ...params.inputProps, tabIndex: 6 }}
                          label={t('RelatedContactItem')}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
                    <Button variant='contained' disabled={contact_item_update.loading} type='submit'>
                      {contact_item_update.loading ? (
                        <CircularProgress
                          sx={{
                            width: '20px !important',
                            height: '20px !important',
                            mr: theme => theme.spacing(2)
                          }}
                        />
                      ) : null}
                      <Translations text='Submit' />
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
        {data.files && data.files.length !== 0 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title={t('SelectedFiles')} />
              <Divider />
              <CardContent sx={{ p: 3, pb: '0.75rem!important' }}>
                {data.files.map((file, index) => (
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
                    {index + 1} <Translations text='DownloadFile' />
                  </Button>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
        {data.type === 'data_complaint' ? (
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={t('UserSearch')}
                action={
                  <Button
                    component={Link}
                    variant='tonal'
                    fullWidth
                    target='_blank'
                    href='/users/create'
                    startIcon={<Icon icon='tabler:plus' />}
                  >
                    <Translations text='AddUser' />
                  </Button>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid item xs={12} sm={12} md={6} lg={6}>
                    <ButtonGroup variant='outlined' fullWidth>
                      <Button
                        onClick={() => {
                          if (role !== 'parent') {
                            handleRoleChange('parent')
                          }
                        }}
                        variant={role === 'parent' ? 'contained' : 'outlined'}
                      >
                        <Translations text='RoleParent' />
                      </Button>
                      <Button
                        onClick={() => {
                          if (role !== 'student') {
                            handleRoleChange('student')
                          }
                        }}
                        variant={role === 'student' ? 'contained' : 'outlined'}
                      >
                        <Translations text='RoleStudent' />
                      </Button>
                    </ButtonGroup>
                  </Grid>
                  {role && (
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                      <CustomAutocomplete
                        id='user_id'
                        size='small'
                        value={user}
                        options={users_lite_list.data}
                        loading={users_lite_list.loading}
                        loadingText={t('ApiLoading')}
                        onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                          setUser(newValue)
                          if (newValue?.key) {
                            window.open(`/users/edit/${newValue.key}`, '_blank')
                          }
                        }}
                        noOptionsText={t('NoRows')}
                        renderOption={(props, item) => (
                          <li {...props} key={item.key}>
                            <ListItemText>{item.value}</ListItemText>
                          </li>
                        )}
                        getOptionLabel={option => option.value || ''}
                        renderInput={params => <TextField {...params} label={t('User')} />}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ) : null}
        {data.related_children?.length > 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardHeader title={t('RelatedContactItems')} />
              <Divider />
              <MaterialReactTable table={table} />
            </Card>
          </Grid>
        ) : null}
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

ContactItemView.acl = {
  action: 'read',
  subject: 'admin_contact_items'
}

export default ContactItemView
