import { ChangeEvent, ElementType, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  ButtonProps,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  IconButton,
  styled,
  Typography
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import Icon from 'src/shared/components/icon'
import Translations from 'src/app/layouts/components/Translations'
import { MRT_ColumnDef, MRT_RowVirtualizer, MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { useSelector } from 'react-redux'
import * as XLSX from 'xlsx'
import toast, { ToastBar } from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { UserImportType } from 'src/entities/school/UserType'
import { addMultipleUsers } from 'src/features/store/apps/user'
import { convertUserExcelData } from 'src/features/utils/convertUserExcelData'
import { useAuth } from 'src/features/hooks/useAuth'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import { ErrorModelType } from 'src/entities/app/GeneralTypes'
import SelectSchoolWidget from 'src/widgets/general/SelectSchoolWidget'
import UserImportModal from 'src/widgets/general/import/UserImportModal'
import Link from 'next/link'
import { keyframes } from '@emotion/react'

const pulse = keyframes`
  0% {
    background-color: rgba(234, 84, 85, 0.01);
  }
  50% {
    background-color: rgba(234, 84, 85, 0.16);
  }
  100% {
    background-color: rgba(234, 84, 85, 0.01);
  }
`

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const UsersImport = () => {
  const [clickedRow, setClickedRow] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({})
  const [editedUsers, setEditedUsers] = useState<Record<string, UserImportType>>({})

  const tableRef = useRef<HTMLDivElement | null>(null)
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null)
  const router = useRouter()
  const { t } = useTranslation()
  const { current_school } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const { user_add_multiple } = useSelector((state: RootState) => state.user)

  const handleInputFileChange = (file: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader()
    const { files } = file.target

    if (files && files.length !== 0) {
      reader.readAsArrayBuffer(files[0])
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const data = e.target?.result
        if (data instanceof ArrayBuffer) {
          const workbook = XLSX.read(new Uint8Array(data), { type: 'array', cellDates: true, dateNF: 'yyyy"."mm"."dd' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          const json = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            raw: false,
            header: [
              'id',
              'classroom_name',
              'last_name',
              'first_name',
              'middle_name',
              'certificate',
              'birthday',
              'phone',
              'mother.last_name',
              'mother.first_name',
              'mother.middle_name',
              'mother.birthday',
              'mother.phone',
              'father.last_name',
              'father.first_name',
              'father.middle_name',
              'father.birthday',
              'father.phone'
            ]
          }) as any[]
          json.shift()

          if (json[0]?.last_name?.toLowerCase().includes('famili')) {
            json.shift()
          }

          const updatedData = convertUserExcelData(json, current_school?.id)

          setEditedUsers(
            updatedData.reduce((acc: any, object: any) => {
              acc[object.id] = object

              return acc
            }, {})
          )
        }
      }
      if (reader.result !== null) {
        setInputValue(reader.result as string)
      }
    }
  }

  const columns = useMemo<MRT_ColumnDef<UserImportType>[]>(
    () => [
      {
        accessorKey: 'last_name',
        header: t('Surname'),
        size: 150,
        sortingFn: 'customSorting',
        muiTableBodyCellProps: ({ row }) => {
          const cellId = `${row.id}_last_name`
          if (cellId === clickedRow) {
            return {
              sx: {
                animation: `${pulse} 1s ease-in-out 7`
              }
            }
          } else {
            return {}
          }
        },
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: !!validationErrors?.[cell.id],
          id: `${row.id}_last_name`,
          helperText:
            row.id.includes('m') || row.id.includes('f')
              ? `Ata-ene ${validationErrors?.[cell.id] ? validationErrors?.[cell.id] : ''}`
              : `Okuwçy ${validationErrors?.[cell.id] ? validationErrors?.[cell.id] : ''}`,
          onBlur: event => {
            setValidationErrors(prevState => {
              const newObject = { ...prevState }
              delete newObject[cell.id]

              return newObject
            })
            if (!/\D/.test(row.id)) {
              setEditedUsers({
                ...editedUsers,
                [row.id]: { ...row.original, last_name: event.target.value }
              })
            } else {
              setEditedUsers(prevState => {
                return {
                  ...prevState,
                  [parseInt(row.id, 10)]: {
                    ...prevState[parseInt(row.id, 10)],
                    parents: prevState[parseInt(row.id, 10)].parents.map(parent =>
                      parent.id.toString() === row.id ? { ...parent, last_name: event.target.value } : parent
                    )
                  }
                }
              })
            }
          }
        })
      },
      {
        accessorKey: 'first_name',
        header: t('Name'),
        size: 150,
        sortingFn: 'customSorting',
        muiTableBodyCellProps: ({ row }) => {
          const cellId = `${row.id}_first_name`
          if (cellId === clickedRow) {
            return {
              sx: {
                animation: `${pulse} 1s ease-in-out 7`
              }
            }
          } else {
            return {}
          }
        },
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          id: `${row.id}_first_name`,
          onBlur: event => {
            setValidationErrors(prevState => {
              const newObject = { ...prevState }
              delete newObject[cell.id]

              return newObject
            })
            if (!/\D/.test(row.id)) {
              setEditedUsers({
                ...editedUsers,
                [row.id]: { ...row.original, first_name: event.target.value }
              })
            } else {
              setEditedUsers(prevState => {
                return {
                  ...prevState,
                  [parseInt(row.id, 10)]: {
                    ...prevState[parseInt(row.id, 10)],
                    parents: prevState[parseInt(row.id, 10)].parents.map(parent =>
                      parent.id.toString() === row.id ? { ...parent, first_name: event.target.value } : parent
                    )
                  }
                }
              })
            }
          }
        })
      },
      {
        accessorKey: 'middle_name',
        header: t('FatherName'),
        size: 150,
        sortingFn: 'customSorting',
        muiTableBodyCellProps: ({ row }) => {
          const cellId = `${row.id}_middle_name`
          if (cellId === clickedRow) {
            return {
              sx: {
                animation: `${pulse} 1s ease-in-out 7`
              }
            }
          } else {
            return {}
          }
        },
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          id: `${row.id}_middle_name`,
          onBlur: event => {
            setValidationErrors(prevState => {
              const newObject = { ...prevState }
              delete newObject[cell.id]

              return newObject
            })
            if (!/\D/.test(row.id)) {
              setEditedUsers({
                ...editedUsers,
                [row.id]: { ...row.original, middle_name: event.target.value }
              })
            } else {
              setEditedUsers(prevState => {
                return {
                  ...prevState,
                  [parseInt(row.id, 10)]: {
                    ...prevState[parseInt(row.id, 10)],
                    parents: prevState[parseInt(row.id, 10)].parents.map(parent =>
                      parent.id.toString() === row.id ? { ...parent, middle_name: event.target.value } : parent
                    )
                  }
                }
              })
            }
          }
        })
      },
      {
        accessorKey: 'birthday',
        header: t('Birthday'),
        size: 150,
        muiTableBodyCellProps: ({ row }) => {
          const cellId = `${row.id}_birthday`
          if (cellId === clickedRow) {
            return {
              sx: {
                animation: `${pulse} 1s ease-in-out 7`
              }
            }
          } else {
            return {}
          }
        },
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          id: `${row.id}_birthday`,
          onBlur: event => {
            setValidationErrors(prevState => {
              const newObject = { ...prevState }
              delete newObject[cell.id]

              return newObject
            })
            if (!/\D/.test(row.id)) {
              setEditedUsers({
                ...editedUsers,
                [row.id]: { ...row.original, birthday: event.target.value }
              })
            } else {
              setEditedUsers(prevState => {
                return {
                  ...prevState,
                  [parseInt(row.id, 10)]: {
                    ...prevState[parseInt(row.id, 10)],
                    parents: prevState[parseInt(row.id, 10)].parents.map(parent =>
                      parent.id.toString() === row.id ? { ...parent, birthday: event.target.value } : parent
                    )
                  }
                }
              })
            }
          }
        })
      },
      {
        accessorKey: 'phone',
        header: t('Phone'),
        size: 150,
        muiTableBodyCellProps: ({ row }) => {
          const cellId = `${row.id}_phone`
          if (cellId === clickedRow) {
            return {
              sx: {
                animation: `${pulse} 1s ease-in-out 7`
              }
            }
          } else {
            return {}
          }
        },
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          id: `${row.id}_phone`,
          onBlur: event => {
            setValidationErrors(prevState => {
              const newObject = { ...prevState }
              delete newObject[cell.id]

              return newObject
            })
            if (!/\D/.test(row.id)) {
              setEditedUsers({
                ...editedUsers,
                [row.id]: { ...row.original, phone: event.target.value }
              })
            } else {
              setEditedUsers(prevState => {
                return {
                  ...prevState,
                  [parseInt(row.id, 10)]: {
                    ...prevState[parseInt(row.id, 10)],
                    parents: prevState[parseInt(row.id, 10)].parents.map(parent =>
                      parent.id.toString() === row.id ? { ...parent, phone: event.target.value } : parent
                    )
                  }
                }
              })
            }
          }
        })
      },
      {
        accessorKey: 'classroom_name',
        header: t('Classroom'),
        size: 150,
        enableEditing(row) {
          if (!/\D/.test(row.id)) {
            return true
          } else {
            return false
          }
        },
        muiTableBodyCellProps: ({ row }) => {
          const cellId = `${row.id}_classroom_name`
          if (cellId === clickedRow) {
            return {
              sx: {
                animation: `${pulse} 1s ease-in-out 7`
              }
            }
          } else {
            return {}
          }
        },
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          id: `${row.id}_classroom_name`,
          onBlur: event => {
            setValidationErrors(prevState => {
              const newObject = { ...prevState }
              delete newObject[cell.id]

              return newObject
            })
            if (!/\D/.test(row.id)) {
              setEditedUsers({
                ...editedUsers,
                [row.id]: { ...row.original, classroom_name: event.target.value }
              })
            } else {
              setEditedUsers(prevState => {
                return {
                  ...prevState,
                  [parseInt(row.id, 10)]: {
                    ...prevState[parseInt(row.id, 10)],
                    parents: prevState[parseInt(row.id, 10)].parents.map(parent =>
                      parent.id.toString() === row.id ? { ...parent, classroom_name: event.target.value } : parent
                    )
                  }
                }
              })
            }
          }
        })
      }
    ],
    [clickedRow, editedUsers, t, validationErrors]
  )

  const handleScrollToCell = (val: string) => {
    const parts = val.split('_')
    const id = parts[0]

    if (id) {
      const rowIndex = table.getRowModel().rows.findIndex(row => row.id === id)
      if (rowIndex) {
        setClickedRow(val)
      }
      try {
        rowVirtualizerInstanceRef.current?.scrollToIndex?.(rowIndex)
      } catch (error) {
        console.error(error)
      }
      setTimeout(() => {
        if (tableRef.current) {
          tableRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }, 10)
    }
  }

  const handleSaveUsers = () => {
    const usersToSend = Object.values(JSON.parse(JSON.stringify(editedUsers)))
    usersToSend.map((user: any) => {
      delete user.id
      user.parents.map((parent: any) => {
        delete parent.id

        return parent
      })

      return user
    })

    const obj = {
      users: usersToSend
    }

    dispatch(addMultipleUsers(obj))
      .unwrap()
      .then(res => {
        if (res?.total_created) {
          toast.custom(
            t => (
              <ToastBar toast={t}>
                {({ icon }) => (
                  <Box display='flex' alignItems='center' gap={3}>
                    {icon}
                    {`${res.total_created} sany ulanyjy üstünlikli döredildi`}
                    {t.type !== 'loading' && (
                      <IconButton
                        aria-label='dismiss'
                        color='secondary'
                        size='medium'
                        sx={{
                          width: '2.2rem!important',
                          height: '2.2rem!important',
                          '& svg': { fontSize: '1.5rem!important' }
                        }}
                        onClick={() => toast.dismiss(t.id)}
                      >
                        <Icon icon='tabler:x' fontSize='inherit' />
                      </IconButton>
                    )}
                  </Box>
                )}
              </ToastBar>
            ),
            { duration: Infinity }
          )
        }

        router.push('/users')
      })
      .catch(err => {
        const errObj: any = {}
        err.errors?.map((error: ErrorModelType) => {
          const errArr = error.key?.split('.').slice(1)
          if (errArr && errArr.length > 0) {
            if (errArr.includes('parents')) {
              const user = Object.values(editedUsers)[parseInt(errArr[0]) - 1]
              const parentId = errArr[2] === '1' ? user.id + 'm' : errArr[2] === '2' ? user.id + 'f' : null
              const errKey = parentId + '_' + errArr[3]
              errObj[errKey] = errorHandler({ error: {}, errors: [error] })
            } else {
              const errKey = Object.values(editedUsers)[parseInt(errArr[0]) - 1]?.id + '_' + errArr[1]
              errObj[errKey] = errorHandler({ error: {}, errors: [error] })
            }
          }
        })
        setValidationErrors({
          ...validationErrors,
          ...errObj
        })
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  const handleDeleteRow = (id: number | string) => {
    const key = Object.keys(validationErrors).find(key => key.includes(id.toString()))
    if (key) {
      setValidationErrors(prevState => {
        const newObject = { ...prevState }
        delete newObject[key]

        return newObject
      })
    }
    if (!/\D/.test(id.toString())) {
      const updatedUsers = { ...editedUsers }
      delete updatedUsers[id]
      setEditedUsers(updatedUsers)
    } else {
      setEditedUsers(prevState => {
        return {
          ...prevState,
          [parseInt(id.toString(), 10)]: {
            ...prevState[parseInt(id.toString(), 10)],
            parents: prevState[parseInt(id.toString(), 10)].parents.filter(parent => parent.id !== id)
          }
        }
      })
    }
  }

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableEditing: true,
    enableSorting: true,
    enableExpanding: true,
    enableExpandAll: true,
    enableRowActions: true,
    enableRowNumbers: true,
    enableStickyHeader: true,
    enableRowVirtualization: true,
    enableHiding: false,
    enablePagination: false,
    enableRowSelection: false,
    enableGlobalFilter: false,
    enableDensityToggle: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    rowVirtualizerInstanceRef,
    rowVirtualizerOptions: {
      overscan: 1
    },
    columns,
    data: Object.values(editedUsers),
    editDisplayMode: 'table',
    positionActionsColumn: 'last',
    rowNumberDisplayMode: 'original',
    renderTopToolbar: false,
    getRowId: row => row.id.toString(),
    getSubRows: originalRow => originalRow.parents,
    muiTableContainerProps: {
      ref: tableRef,
      sx: { maxHeight: '75vh' }
    },
    muiBottomToolbarProps: {
      sx: {
        justifyContent: 'end'
      }
    },
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 100,
        grow: false
      }
    },
    renderRowActions: ({ row }) => (
      <Box>
        <IconButton
          size='small'
          onClick={() => {
            handleDeleteRow(row.original.id)
          }}
          sx={{ color: 'text.secondary' }}
        >
          <Icon icon='tabler:trash' fontSize={22} />
        </IconButton>
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center', my: 2, mr: 2 }}>
        <Button
          color='primary'
          variant='contained'
          onClick={handleSaveUsers}
          disabled={
            user_add_multiple.loading ||
            Object.values(editedUsers).length === 0 ||
            Object.values(validationErrors).some(error => !!error)
          }
        >
          {user_add_multiple.loading ? <CircularProgress size={25} /> : <Translations text='Save' />}
        </Button>
      </Box>
    ),
    initialState: {
      expanded: true
    },
    state: {
      density: 'compact',
      isSaving: user_add_multiple.loading
    }
  })

  const handleClose = () => {
    setDialogOpen(false)
  }

  if (current_school === null) return <SelectSchoolWidget />

  return (
    <>
      {dialogOpen && <UserImportModal dialogOpen={dialogOpen} handleClose={handleClose} />}
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('AddMultipleUsers')}
              action={
                <Box display={'flex'} gap={3}>
                  <Button
                    fullWidth
                    color='success'
                    variant='contained'
                    locale={false}
                    target='_blank'
                    component={Link}
                    href='/files/Ulanyjylar import (nusga).xlsx'
                    sx={{ minWidth: 190 }}
                    startIcon={<Icon icon='tabler:download' />}
                  >
                    <Translations text='DownloadImportSample' />
                  </Button>
                  <Button
                    fullWidth
                    color='primary'
                    variant='tonal'
                    sx={{ minWidth: 190 }}
                    onClick={() => setDialogOpen(true)}
                    startIcon={<Icon icon='tabler:help' />}
                  >
                    <Translations text='HowToAdd' />
                  </Button>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={4}>
                  <ButtonStyled
                    color='success'
                    component='label'
                    variant='contained'
                    htmlFor='excel-upload'
                    startIcon={<Icon icon='tabler:paperclip' fontSize={20} />}
                  >
                    <Translations text='UploadFile' />
                    <input hidden type='file' value={inputValue} onChange={handleInputFileChange} id='excel-upload' />
                  </ButtonStyled>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        {Object.values(validationErrors)?.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={t('Errors') + ` (${Object.values(validationErrors)?.length})`}
                action={
                  <Button
                    color='error'
                    variant='tonal'
                    sx={{ px: 10, minWidth: 130 }}
                    onClick={() => {
                      setCollapsed(!collapsed)
                    }}
                    endIcon={<Icon icon={!collapsed ? 'tabler:chevron-down' : 'tabler:chevron-up'} fontSize={20} />}
                  >
                    <Translations text='All' />
                  </Button>
                }
              />
              <Collapse in={collapsed}>
                <CardContent>
                  <Box height={500} sx={{ overflowY: 'scroll' }}>
                    <Box display='flex' justifyContent='center' flexDirection='column' gap={2}>
                      {Object.entries(validationErrors).map(([key, value]) => (
                        <Alert
                          key={key}
                          severity='error'
                          onClick={() => handleScrollToCell(key)}
                          sx={{ cursor: 'pointer', '& .MuiAlert-message': { width: '100%' } }}
                        >
                          <Box display='flex' flexDirection='row' justifyContent='space-between'>
                            {value}
                            <Typography color={'error.main'} sx={{ fontWeight: '600', textDecoration: 'none' }}>
                              <Translations text='ShowInTable' />
                            </Typography>
                          </Box>
                        </Alert>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Collapse>
            </Card>
          </Grid>
        )}
        <Grid item xs={12}>
          <Card>
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

UsersImport.acl = {
  action: 'write',
  subject: 'admin_users'
}

export default UsersImport
