import { ReactElement, Ref, SyntheticEvent, forwardRef, useContext, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Fade,
  FadeProps,
  Grid,
  IconButton,
  IconButtonProps,
  ListItemText,
  Typography,
  styled
} from '@mui/material'
import Icon from 'src/shared/components/icon'
import Translations from 'src/app/layouts/components/Translations'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { SubjectCreateType, SubjectListType, SubjectSettingsType } from 'src/entities/classroom/SubjectType'
import CustomTextField from 'src/shared/components/mui/text-field'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import Link from 'next/link'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import toast from 'react-hot-toast'
import { addSubject, deleteSubject } from 'src/features/store/apps/subjects'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import { fetchUsersLite } from 'src/features/store/apps/user'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { getCurrentClassroom } from 'src/features/store/apps/classrooms'
import { useSelector } from 'react-redux'
import { ClassroomType } from 'src/entities/classroom/ClassroomType'
import { useDialog } from 'src/app/context/DialogContext'
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import dataTableConfig from 'src/app/configs/dataTableConfig'

interface PropsType {
  data: ClassroomType | null
  id: string | null
}

const subjectDefaultValues: SubjectCreateType = {
  name: '',
  full_name: '',
  week_hours: null,
  classroom_id: null,
  classroom_type: null,
  classroom_type_key: null,
  teacher_id: null,
  second_teacher_id: null,
  school_id: null
}

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

const CustomCloseButton = styled(IconButton)<IconButtonProps>(({ theme }) => ({
  top: 0,
  right: 0,
  color: 'grey.500',
  position: 'absolute',
  boxShadow: theme.shadows[2],
  transform: 'translate(10px, -10px)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette.background.paper} !important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'translate(7px, -5px)'
  }
}))

const ClassroomSubjectCard = (props: PropsType) => {
  const { data, id } = props

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [show3, setShow3] = useState<boolean>(false)
  const [subjectFormData, setSubjectFormData] = useState<SubjectCreateType>(subjectDefaultValues)
  const [subjectName, setSubjectName] = useState<SubjectSettingsType | null>(null)
  const [teacher, setTeacher] = useState<LiteModelType | null>(null)
  const [secondTeacher, setSecondTeacher] = useState<LiteModelType | null>(null)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const showDialog = useDialog()
  const { t } = useTranslation()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { settings } = useSelector((state: RootState) => state.settings)
  const { users_lite_list } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    if (show3 === true) {
      const params: any = {
        limit: 5000,
        offset: 0,
        role: 'teacher'
      }
      if (data?.school_id) {
        params.school_id = data.school_id
      }
      dispatch(fetchUsersLite(params))
    }
  }, [show3, data, dispatch])

  const handleSubjectFormChange = (
    field: keyof SubjectCreateType,
    value: SubjectCreateType[keyof SubjectCreateType]
  ) => {
    setSubjectFormData({ ...subjectFormData, [field]: value })
  }

  const onSubjectSubmit = (dataT: SubjectCreateType) => {
    setIsSubmitting(true)
    if (data?.id !== undefined) {
      dataT = { ...dataT, classroom_id: data?.id, school_id: data?.school?.id }
    }
    dispatch(addSubject(dataT))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        setSubjectName(null)
        setTeacher(null)
        setSecondTeacher(null)
        setSubjectFormData(subjectDefaultValues)
        dispatch(getCurrentClassroom(id as string))
        setIsSubmitting(false)
        setShow3(false)
      })
      .catch(err => {
        const errorObject: ErrorKeyType = {}
        err.errors?.map((err: ErrorModelType) => {
          if (err.key && err.code) {
            errorObject[err.key] = err.code
          }
        })
        setErrors(errorObject)
        toast.error(errorHandler(err), {
          duration: 2000
        })
        setIsSubmitting(false)
      })
  }

  const handleShowDialog = async (arr: string[]) => {
    const confirmed = await showDialog()
    if (confirmed) {
      handleRemoveSubject(arr)
    }
  }

  const handleRemoveSubject = async (row_id: string[]) => {
    setIsSubmitting(true)
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteSubject(row_id))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        dispatch(getCurrentClassroom(id as string))
        setIsSubmitting(false)
      })
      .catch(err => {
        setIsSubmitting(false)
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const columns = useMemo<MRT_ColumnDef<SubjectListType>[]>(
    () => [
      {
        accessorKey: 'name',
        accessorFn: row => row.name,
        id: 'name',
        header: t('Name'),
        sortingFn: 'customSorting',
        Cell: ({ row }) => (
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>{row.original.name}</Typography>
        )
      },
      {
        accessorKey: 'week_hours',
        accessorFn: row => row.week_hours,
        id: 'week_hours',
        header: t('LessonHours'),
        Cell: ({ row }) => <Typography>{row.original.week_hours}</Typography>
      },
      {
        accessorKey: 'teacher',
        accessorFn: row => row.teacher?.last_name,
        id: 'teacher',
        header: t('Teacher'),
        sortingFn: 'customSorting',
        Cell: ({ row }) => (
          <Typography
            component={Link}
            href={`/users/view/${row.original.teacher?.id}`}
            color={'primary.main'}
            sx={{ fontWeight: '600', textDecoration: 'none' }}
          >
            {renderUserFullname(
              row.original.teacher?.last_name,
              row.original.teacher?.first_name,
              row.original.teacher?.middle_name
            )}
          </Typography>
        )
      }
    ],
    [t]
  )

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableSorting: true,
    enableRowActions: true,
    enableRowNumbers: true,
    enableStickyHeader: true,
    enableHiding: false,
    enableEditing: false,
    enableGrouping: false,
    enablePagination: false,
    enableRowSelection: false,
    enableGlobalFilter: false,
    enableStickyFooter: false,
    enableDensityToggle: false,
    renderBottomToolbar: false,
    enableColumnPinning: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    renderTopToolbar: false,
    muiTableBodyCellProps: {
      padding: 'none'
    },
    muiTablePaperProps: {
      sx: {
        borderRadius: '0',
        boxShadow: 'none!important'
      }
    },
    muiTableContainerProps: {
      sx: { maxHeight: 'none' }
    },
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 120,
        grow: false
      }
    },
    positionActionsColumn: 'last',
    columns,
    data: data?.subjects ? data?.subjects : [],
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          variant='tonal'
          size='small'
          component={Link}
          href={`/subjects/view/${row.original.id}`}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
        {ability?.can('write', 'admin_classrooms') ? (
          <Button
            variant='tonal'
            color='error'
            size='small'
            onClick={() => {
              handleShowDialog([row.original.id])
            }}
            startIcon={<Icon icon='tabler:trash' fontSize={20} />}
          >
            <Translations text='Delete' />
          </Button>
        ) : null}
      </Box>
    ),
    state: {
      density: 'compact'
    }
  })

  return (
    <>
      <Dialog
        fullWidth
        open={show3}
        maxWidth='md'
        scroll='body'
        onClose={() => setShow3(false)}
        TransitionComponent={Transition}
        onBackdropClick={() => setShow3(false)}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <form
          autoComplete='off'
          onSubmit={e => {
            e.preventDefault()
            onSubjectSubmit(subjectFormData)
          }}
        >
          <DialogContent
            sx={{
              pb: theme => `${theme.spacing(8)} !important`,
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <CustomCloseButton onClick={() => setShow3(false)}>
              <Icon icon='tabler:x' fontSize='1.25rem' />
            </CustomCloseButton>
            <Typography variant='h3' textAlign={'center'} fontWeight={600} sx={{ mb: 8 }}>
              <Translations text='AddSubject' />
            </Typography>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <CustomAutocomplete
                  id='name'
                  value={subjectName}
                  options={settings.data.subject?.subjects}
                  loadingText={t('ApiLoading')}
                  loading={settings.loading}
                  onChange={(event: SyntheticEvent, newValue: SubjectSettingsType | null) => {
                    setSubjectName(newValue)
                    if (newValue) {
                      setSubjectFormData({ ...subjectFormData, name: newValue.name, full_name: newValue.full_name })
                    }
                  }}
                  noOptionsText={t('NoRows')}
                  renderOption={(props, item) => (
                    <li {...props} key={item.full_name}>
                      <ListItemText>{item.full_name}</ListItemText>
                    </li>
                  )}
                  getOptionLabel={option => option.full_name || ''}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label={t('Name')}
                      {...(errors && errors['name']
                        ? { error: true, helperText: errorTextHandler(errors['name']) }
                        : null)}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label={t('Classroom')}
                  fullWidth
                  defaultValue={data?.name}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  type='number'
                  onWheel={event => event.target instanceof HTMLElement && event.target.blur()}
                  label={t('LessonHours')}
                  onChange={e =>
                    handleSubjectFormChange('week_hours', e.target.value !== '' ? parseInt(e.target.value) : null)
                  }
                  {...(errors && errors['week_hours']
                    ? { error: true, helperText: errorTextHandler(errors['week_hours']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label={t('School')}
                  fullWidth
                  defaultValue={data?.school?.name}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomAutocomplete
                  id='teacher_id'
                  value={teacher}
                  options={users_lite_list.data}
                  loading={users_lite_list.loading}
                  loadingText={t('ApiLoading')}
                  onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                    setTeacher(newValue)
                    handleSubjectFormChange('teacher_id', newValue?.key)
                  }}
                  noOptionsText={t('NoRows')}
                  renderOption={(props, item) => (
                    <li {...props} key={item.key}>
                      <ListItemText>{item.value}</ListItemText>
                    </li>
                  )}
                  getOptionLabel={option => option.value || ''}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label={t('Teacher')}
                      {...(errors && errors['teacher_id']
                        ? { error: true, helperText: errorTextHandler(errors['teacher_id']) }
                        : null)}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomAutocomplete
                  id='second_teacher_id'
                  value={secondTeacher}
                  options={users_lite_list.data}
                  loading={users_lite_list.loading}
                  loadingText={t('ApiLoading')}
                  onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                    setSecondTeacher(newValue)
                    handleSubjectFormChange('second_teacher_id', newValue?.key)
                  }}
                  noOptionsText={t('NoRows')}
                  renderOption={(props, item) => (
                    <li {...props} key={item.key}>
                      <ListItemText>{item.value}</ListItemText>
                    </li>
                  )}
                  getOptionLabel={option => option.value || ''}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label={t('SecondTeacher')}
                      {...(errors && errors['second_teacher_id']
                        ? { error: true, helperText: errorTextHandler(errors['second_teacher_id']) }
                        : null)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: 'center',
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <Button variant='contained' type='submit' sx={{ mr: 4 }} disabled={isSubmitting}>
              {isSubmitting ? (
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
            <Button
              variant='tonal'
              color='secondary'
              onClick={() => {
                setShow3(false)
              }}
            >
              <Translations text='GoBack' />
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={t('SubjectsOfClassroom')}
            action={
              ability.can('write', 'admin_classrooms') ? (
                <Button
                  variant='tonal'
                  onClick={() => setShow3(true)}
                  startIcon={<Icon icon='tabler:plus' fontSize={20} />}
                >
                  <Translations text='AddSubject' />
                </Button>
              ) : null
            }
          />
          <Divider />
          <CardContent sx={{ p: '0!important' }}>
            <MaterialReactTable table={table} />
          </CardContent>
        </Card>
      </Grid>
    </>
  )
}

export default ClassroomSubjectCard
