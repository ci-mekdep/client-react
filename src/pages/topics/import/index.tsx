// ** MUI Imports
import { ChangeEvent, ElementType, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  ButtonProps,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled
} from '@mui/material'
import * as XLSX from 'xlsx'
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { TopicImportType } from 'src/entities/journal/TopicType'
import Icon from 'src/shared/components/icon'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { addMultipleTopic } from 'src/features/store/apps/topics'
import { fetchSettings } from 'src/features/store/apps/settings'
import { useRouter } from 'next/router'
import TopicImportModal from 'src/widgets/general/import/TopicImportModal'
import Link from 'next/link'
import dataTableConfig from 'src/app/configs/dataTableConfig'

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const TopicsImport = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [classyear, setClassyear] = useState<string>('1')
  const [inputValue, setInputValue] = useState<string>('')

  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({})
  const [editedTopics, setEditedTopics] = useState<Record<string, TopicImportType>>({})

  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { topic_add_multiple } = useSelector((state: RootState) => state.topics)
  const { settings } = useSelector((state: RootState) => state.settings)

  useEffect(() => {
    dispatch(fetchSettings({}))
  }, [dispatch])

  const handleInputFileChange = (file: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader()
    const { files } = file.target

    if (files && files.length !== 0) {
      reader.readAsArrayBuffer(files[0])

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const data = e.target?.result
        if (data instanceof ArrayBuffer) {
          const workbook = XLSX.read(new Uint8Array(data), { type: 'array' })
          const sheetName = workbook.SheetNames[getCurrentReportTitle(classyear)]
          const worksheet = workbook.Sheets[sheetName]
          const json = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            header: ['id', 'subject', 'period', 'level', 'language', 'title']
          }) as object[]
          json.shift()

          const updatedData = json.map((data: any, index) => {
            const lang = data.language
            const level = data.level
              .replaceAll('Ý', 'y')
              .replaceAll('ý', 'y')
              .replaceAll('Ö', 'o')
              .replaceAll('ö', 'o')
              .replaceAll('Ü', 'u')
              .replaceAll('ü', 'u')
              .replaceAll('Ä', 'a')
              .replaceAll('ä', 'a')
              .toLowerCase()

            const newObj: any = {
              ...data,
              id: index + 1,
              level: level,
              classyear: classyear,
              language: lang.length > 0 ? lang.toLowerCase() : lang
            }
            Object.keys(newObj).forEach(
              k => (newObj[k] = newObj[k] === '' ? null : k !== 'id' ? newObj[k].toString() : newObj[k])
            )

            return newObj
          })

          setEditedTopics(
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

  const columns = useMemo<MRT_ColumnDef<TopicImportType>[]>(
    () => [
      {
        accessorKey: 'title',
        header: t('Name'),
        size: 500,
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          onBlur: event => {
            const validationError = !validateRequired(event.currentTarget.value) ? 'Hökman girizmeli' : undefined
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError
            })
            setEditedTopics({
              ...editedTopics,
              [row.id]: { ...row.original, title: event.target.value }
            })
          }
        })
      },
      {
        accessorKey: 'subject',
        header: t('Subject'),
        editVariant: 'select',
        editSelectOptions:
          !settings.loading && settings.status === 'success'
            ? settings.data.subject.subjects.map(subject => subject.name)
            : [],
        muiEditTextFieldProps: ({ cell, row }) => ({
          select: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          onBlur: event => {
            const validationError = !validateRequired(event.target.value) ? 'Hökman girizmeli' : undefined
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError
            })
          },
          onChange: event =>
            setEditedTopics({
              ...editedTopics,
              [row.id]: { ...row.original, subject: event.target.value }
            })
        })
      },
      {
        accessorKey: 'level',
        header: t('Level'),
        editVariant: 'select',
        editSelectOptions: ['adaty', 'yorite', 'hunar'],
        muiEditTextFieldProps: ({ row, cell }) => ({
          select: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          onChange: event => {
            setEditedTopics({
              ...editedTopics,
              [row.id]: { ...row.original, level: event.target.value }
            })
          }
        })
      },
      {
        accessorKey: 'period',
        header: t('Quarter'),
        editVariant: 'select',
        editSelectOptions: ['1', '2', '3', '4'],
        muiEditTextFieldProps: ({ row, cell }) => ({
          select: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          onChange: event =>
            setEditedTopics({
              ...editedTopics,
              [row.id]: { ...row.original, period: event.target.value }
            })
        })
      },
      {
        accessorKey: 'language',
        header: t('ClassroomLangType'),
        editVariant: 'select',
        editSelectOptions: ['tm', 'ru', 'en'],
        muiEditTextFieldProps: ({ row, cell }) => ({
          select: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          onBlur: event => {
            const validationError = !validateRequired(event.target.value) ? 'Hökman girizmeli' : undefined
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError
            })
          },
          onChange: event =>
            setEditedTopics({
              ...editedTopics,
              [row.id]: { ...row.original, language: event.target.value }
            })
        })
      },
      {
        accessorKey: 'classyear',
        header: t('Classroom')
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editedTopics, t, validationErrors]
  )

  const handleSaveTopics = () => {
    const obj = {
      topics: Object.values(editedTopics)
    }

    dispatch(addMultipleTopic(obj))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        router.push('/settings/topics')
      })
      .catch(err => {
        const errArr = err.key.split('.').slice(1)
        if (errArr.length > 0) {
          const errKey = Object.values(editedTopics)[errArr[0] - 1].id + '_' + errArr[1]
          setValidationErrors({
            ...validationErrors,
            [errKey]: errorHandler(err)
          })
        }
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  const getCurrentReportTitle = (year: string) => {
    switch (year) {
      case '1':
        return 0
        break
      case '2':
        return 1
        break
      case '3':
        return 2
        break
      case '4':
        return 3
        break
      case '5':
        return 4
        break
      case '6':
        return 5
        break
      case '7':
        return 6
        break
      case '8':
        return 7
        break
      case '9':
        return 8
        break
      case '10':
        return 9
        break
      case '11':
        return 10
        break
      case '12':
        return 11
        break
      default:
        return 0
        break
    }
  }

  const handleDeleteRow = (id: string) => {
    const key = Object.keys(validationErrors).find(key => key.includes(id.toString()))
    if (key) {
      setValidationErrors(prevState => {
        const newObject = { ...prevState }
        delete newObject[key]

        return newObject
      })
    }
    const updatedTopics = { ...editedTopics }
    delete updatedTopics[id]
    setEditedTopics(updatedTopics)
  }

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableEditing: true,
    enableRowActions: true,
    enableRowNumbers: true,
    enableStickyHeader: true,
    enableRowVirtualization: true,
    enableHiding: false,
    enableSorting: false,
    enablePagination: false,
    enableRowSelection: false,
    enableGlobalFilter: false,
    enableDensityToggle: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    rowVirtualizerOptions: {
      overscan: 1
    },
    columns,
    data: Object.values(editedTopics),
    editDisplayMode: 'table',
    positionActionsColumn: 'last',
    renderTopToolbar: false,
    getRowId: row => row.id.toString(),
    muiTableContainerProps: {
      sx: {
        minHeight: 'none'
      }
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
          onClick={handleSaveTopics}
          disabled={
            topic_add_multiple.loading ||
            Object.values(editedTopics).length === 0 ||
            Object.values(validationErrors).some(error => !!error)
          }
        >
          {topic_add_multiple.loading ? <CircularProgress size={25} /> : <Translations text='Save' />}
        </Button>
      </Box>
    ),
    state: {
      density: 'compact',
      isSaving: topic_add_multiple.loading
    }
  })

  const handleClose = () => {
    setDialogOpen(false)
  }

  return (
    <>
      {dialogOpen && <TopicImportModal dialogOpen={dialogOpen} handleClose={handleClose} />}
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('AddMultipleTopics')}
              action={
                <Box display={'flex'} gap={3}>
                  <Button
                    fullWidth
                    color='success'
                    variant='contained'
                    locale={false}
                    target='_blank'
                    component={Link}
                    href='/files/Meýilnamalar import (nusga).xlsx'
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
                  <FormControl fullWidth size='small' sx={{ mr: 5 }}>
                    <InputLabel id='classyear-filter-label'>
                      <Translations text='Classroom' />
                    </InputLabel>
                    <Select
                      label={t('Classroom')}
                      defaultValue='1'
                      value={classyear}
                      onChange={(e: SelectChangeEvent<string>) => setClassyear(e.target.value)}
                      id='classyear-filter'
                      labelId='classyear-filter-label'
                    >
                      <MenuItem value='1'>1</MenuItem>
                      <MenuItem value='2'>2</MenuItem>
                      <MenuItem value='3'>3</MenuItem>
                      <MenuItem value='4'>4</MenuItem>
                      <MenuItem value='5'>5</MenuItem>
                      <MenuItem value='6'>6</MenuItem>
                      <MenuItem value='7'>7</MenuItem>
                      <MenuItem value='8'>8</MenuItem>
                      <MenuItem value='9'>9</MenuItem>
                      <MenuItem value='10'>10</MenuItem>
                      <MenuItem value='11'>11</MenuItem>
                      <MenuItem value='12'>12</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
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
        <Grid item xs={12}>
          <Card>
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

TopicsImport.acl = {
  action: 'write',
  subject: 'admin_topics'
}

export default TopicsImport

const validateRequired = (value: string) => !!value.length
