// ** MUI Imports
import { ChangeEvent, ElementType, useMemo, useState } from 'react'
import {
  Box,
  Button,
  ButtonProps,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  styled
} from '@mui/material'
import * as XLSX from 'xlsx'
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { AppDispatch, RootState } from 'src/features/store'
import Icon from 'src/shared/components/icon'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import Translations from 'src/app/layouts/components/Translations'
import { SubjectImportType } from 'src/entities/classroom/SubjectType'
import { addMultipleSubject } from 'src/features/store/apps/subjects'
import { useRouter } from 'next/router'
import { useAuth } from 'src/features/hooks/useAuth'
import SelectSchoolWidget from 'src/widgets/general/SelectSchoolWidget'
import SubjectImportModal from 'src/widgets/general/import/SubjectImportModal'
import Link from 'next/link'
import dataTableConfig from 'src/app/configs/dataTableConfig'

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const SubjectsImport = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({})
  const [editedSubjects, setEditedSubjects] = useState<Record<string, SubjectImportType>>({})

  const router = useRouter()
  const { t } = useTranslation()
  const { current_school } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const { subject_add_multiple } = useSelector((state: RootState) => state.subjects)

  const handleInputFileChange = (file: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader()
    const { files } = file.target

    if (files && files.length !== 0) {
      reader.readAsArrayBuffer(files[0])
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const data = e.target?.result
        if (data instanceof ArrayBuffer) {
          const workbook = XLSX.read(new Uint8Array(data), { type: 'array' })
          const sheetName = workbook.SheetNames[1]
          const worksheet = workbook.Sheets[sheetName]
          const json = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            header: ['id', 'classroom_name', 'name', 'week_hours', 'teacher_full_name', 'classroom_type_key']
          }) as object[]
          json.shift()

          const updatedData = json.map((data, index) => {
            const newObj: any = { ...data, id: index + 1 }
            Object.keys(newObj).forEach(k => (newObj[k] = newObj[k] === '' ? null : newObj[k].toString()))

            return newObj
          })

          setEditedSubjects(
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

  const columns = useMemo<MRT_ColumnDef<SubjectImportType>[]>(
    () => [
      {
        accessorKey: 'classroom_name',
        header: t('Classroom'),
        size: 150,
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
            setEditedSubjects({
              ...editedSubjects,
              [row.id]: { ...row.original, classroom_name: event.target.value }
            })
          }
        })
      },
      {
        accessorKey: 'name',
        header: t('Name'),
        size: 300,
        sortingFn: 'customSorting',
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          onBlur: event => {
            const validationError = !validateRequired(event.currentTarget.value) ? 'Hökman girizmeli' : undefined
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError
            })
            setEditedSubjects({
              ...editedSubjects,
              [row.id]: { ...row.original, name: event.target.value }
            })
          }
        })
      },
      {
        accessorKey: 'week_hours',
        header: t('LessonHours'),
        size: 150,
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          onBlur: event => {
            const validationError = !validateRequired(event.currentTarget.value) ? 'Hökman girizmeli' : undefined
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError
            })
            setEditedSubjects({
              ...editedSubjects,
              [row.id]: { ...row.original, week_hours: event.target.value }
            })
          }
        })
      },
      {
        accessorKey: 'teacher_full_name',
        header: t('Teacher'),
        size: 300,
        sortingFn: 'customSorting',
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          onBlur: event => {
            const validationError = !validateRequired(event.currentTarget.value) ? 'Hökman girizmeli' : undefined
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError
            })
            setEditedSubjects({
              ...editedSubjects,
              [row.id]: { ...row.original, teacher_full_name: event.target.value }
            })
          }
        })
      },
      {
        accessorKey: 'classroom_type_key',
        header: t('Subgroup'),
        editVariant: 'select',
        editSelectOptions: ['', '1', '2'],
        muiEditTextFieldProps: ({ cell, row }) => ({
          select: true,
          required: false,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          onChange: event =>
            setEditedSubjects({
              ...editedSubjects,
              [row.id]: { ...row.original, classroom_type_key: event.target.value }
            })
        })
      }
    ],
    [editedSubjects, t, validationErrors]
  )

  const handleSaveSubjects = () => {
    const obj = {
      subjects: Object.values(editedSubjects)
    }

    dispatch(addMultipleSubject(obj))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        router.push('/subjects')
      })
      .catch(err => {
        const errArr = err.key.split('.').slice(1)
        if (errArr.length > 0) {
          const errKey = Object.values(editedSubjects)[errArr[0] - 1].id + '_' + errArr[1]
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

  const handleDeleteRow = (id: string) => {
    const key = Object.keys(validationErrors).find(key => key.includes(id.toString()))
    if (key) {
      setValidationErrors(prevState => {
        const newObject = { ...prevState }
        delete newObject[key]

        return newObject
      })
    }
    const updatedSubjects = { ...editedSubjects }
    delete updatedSubjects[id]
    setEditedSubjects(updatedSubjects)
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
    data: Object.values(editedSubjects),
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
          onClick={handleSaveSubjects}
          disabled={
            subject_add_multiple.loading ||
            Object.values(editedSubjects).length === 0 ||
            Object.values(validationErrors).some(error => !!error)
          }
        >
          {subject_add_multiple.loading ? <CircularProgress size={25} /> : <Translations text='Save' />}
        </Button>
      </Box>
    ),
    state: {
      density: 'compact',
      isSaving: subject_add_multiple.loading
    }
  })

  const handleClose = () => {
    setDialogOpen(false)
  }

  if (current_school === null) return <SelectSchoolWidget />

  return (
    <>
      {dialogOpen && <SubjectImportModal dialogOpen={dialogOpen} handleClose={handleClose} />}
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('AddMultipleSubjects')}
              action={
                <Box display={'flex'} gap={3}>
                  <Button
                    fullWidth
                    color='success'
                    variant='contained'
                    locale={false}
                    target='_blank'
                    component={Link}
                    href='/files/Ders yükler import (nusga).xlsx'
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
        <Grid item xs={12}>
          <Card>
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

SubjectsImport.acl = {
  action: 'write',
  subject: 'admin_subjects'
}

export default SubjectsImport

const validateRequired = (value: string) => !!value.length
