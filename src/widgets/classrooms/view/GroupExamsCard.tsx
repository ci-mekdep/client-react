import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  Fade,
  FadeProps,
  FormControlLabel,
  Grid,
  IconButton,
  IconButtonProps,
  InputAdornment,
  Link,
  ListItemText,
  styled,
  Typography
} from '@mui/material'
import format from 'date-fns/format'
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'
import { ChangeEvent, forwardRef, ReactElement, Ref, useContext, useEffect, useMemo, useState } from 'react'
import { SyntheticEvent } from 'react-draft-wysiwyg'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import Translations from 'src/app/layouts/components/Translations'
import { DateType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { ClassroomType } from 'src/entities/classroom/ClassroomType'
import { SubjectExamCreateType, SubjectExamType } from 'src/entities/classroom/SubjectType'
import { UserListType } from 'src/entities/school/UserType'
import { AppDispatch, RootState } from 'src/features/store'
import { getCurrentClassroom, updateClassroom } from 'src/features/store/apps/classrooms'
import { fetchUsersLite } from 'src/features/store/apps/user'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import Icon from 'src/shared/components/icon'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import CustomAvatar from 'src/shared/components/mui/avatar'
import CustomTextField from 'src/shared/components/mui/text-field'
import { ThemeColor } from 'src/shared/layouts/types'
import { getInitials } from 'src/shared/utils/get-initials'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import { convertClassroomData } from 'src/features/utils/api/convertClassroomData'
import { convertSubjectData } from 'src/features/utils/api/convertSubjectData'
import { useDialog } from 'src/app/context/DialogContext'
import { deleteSubjectExam } from 'src/features/store/apps/subjectExams'
import { convertSubjectExamData } from 'src/features/utils/api/convertSubjectExamData'

interface PropsType {
  id: string
  classroom: ClassroomType
}

interface PickerProps {
  label?: string
}

const CustomInput = forwardRef(({ ...props }: PickerProps, ref) => {
  return <CustomTextField fullWidth autoComplete='off' inputRef={ref} {...props} />
})

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

const defaultValues: SubjectExamCreateType = {
  teacher_id: null,
  start_time: null,
  time_length_min: null,
  room_number: null,
  exam_weight_percent: 25,
  is_required: true
}

const GroupExamsCard = (props: PropsType) => {
  const { id, classroom } = props

  const [show, setShow] = useState<boolean>(false)
  const [show2, setShow2] = useState<boolean>(false)
  const [activeExam, setActiveExam] = useState<SubjectExamType | null>(null)
  const [date, setDate] = useState<DateType>(null)
  const [isRequired, setIsRequired] = useState<boolean>(false)
  const [teacher, setTeacher] = useState<LiteModelType | null>(null)
  const [teachers, setTeachers] = useState<LiteModelType[]>([])
  const [formData, setFormData] = useState<SubjectExamCreateType>(defaultValues)

  // ** Hooks
  const showDialog = useDialog()
  const { t } = useTranslation()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()
  const { users_lite_list } = useSelector((state: RootState) => state.user)
  const { classroom_update } = useSelector((state: RootState) => state.classrooms)

  useEffect(() => {
    dispatch(fetchUsersLite({ limit: 5000, offset: 0, role: 'teacher' }))
      .then(res => {
        setTeachers(res.payload.users)
      })
      .catch(err => {
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }, [dispatch])

  const handleClickEditExam = (exam: SubjectExamType) => {
    setFormData(convertSubjectExamData(exam))
    setDate(exam.start_time ? new Date(exam.start_time) : null)
    setIsRequired(exam.is_required)
    setTeacher(users_lite_list.data.find((user: LiteModelType) => user.key === exam?.teacher?.id) || null)
    setShow(true)
  }

  const handleClickAddExam = () => {
    setDate(null)
    setIsRequired(true)
    setTeacher(null)
    setFormData(defaultValues)
    setShow(true)
  }

  const handleFormChange = (
    field: keyof SubjectExamCreateType,
    value: SubjectExamCreateType[keyof SubjectExamCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  const onSubmit = (obj: SubjectExamCreateType) => {
    const dataToSend = {
      ...convertClassroomData(classroom),
      subjects: [{ ...convertSubjectData(classroom.subjects[0]), exams: [obj] }]
    }

    dispatch(updateClassroom(dataToSend))
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        setShow(false)
        setFormData(defaultValues)
        dispatch(getCurrentClassroom(id))
      })
      .catch(err => {
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  const handleShowExamDialog = async (id: string) => {
    const confirmed = await showDialog()
    if (confirmed) {
      handleDeleteExam(id)
    }
  }

  const handleDeleteExam = async (exam_id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteSubjectExam([exam_id]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        dispatch(getCurrentClassroom(id))
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const columns = useMemo<MRT_ColumnDef<SubjectExamType>[]>(
    () => [
      {
        accessorKey: 'name',
        accessorFn: row => row.name,
        id: 'name',
        header: t('Name'),
        sortingFn: 'customSorting',
        Cell: ({ row }) => <Typography>{row.original.name}</Typography>
      },
      {
        accessorKey: 'teacher',
        accessorFn: row => row.teacher?.last_name,
        id: 'teacher',
        header: t('Teacher'),
        sortingFn: 'customSorting',
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {row.original.teacher && renderAvatar(row.original.teacher)}
            <Typography sx={{ color: 'text.secondary', fontWeight: 600, mr: 2.5 }}>
              {renderUserFullname(
                row.original.teacher?.last_name,
                row.original.teacher?.first_name,
                row.original.teacher?.middle_name
              )}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'exam_weight_percent',
        accessorFn: row => row.exam_weight_percent,
        id: 'exam_weight_percent',
        header: t('ExamWeight'),
        Cell: ({ row }) => <Typography>{row.original.exam_weight_percent + ' %'}</Typography>
      },
      {
        accessorKey: 'is_required',
        accessorFn: row => row.is_required,
        id: 'is_required',
        header: t('ExamRequired'),
        Cell: ({ row }) => (
          <Typography>
            {row.original.is_required === true ? (
              <Icon fontSize='1.25rem' icon='tabler:check' />
            ) : (
              <Icon fontSize='1.25rem' icon='tabler:x' />
            )}
          </Typography>
        )
      },
      {
        accessorKey: 'start_time',
        accessorFn: row => row.start_time,
        id: 'start_time',
        header: t('StartTime'),
        Cell: ({ row }) => (
          <Typography>
            {row.original.start_time && format(new Date(row.original.start_time), 'dd.MM.yyyy HH:mm')}
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
    data: classroom.subjects[0]?.exams ? classroom?.subjects[0].exams : [],
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          variant='tonal'
          size='small'
          onClick={() => {
            setShow2(true)
            setActiveExam(row.original)
          }}
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
        >
          <Translations text='View' />
        </Button>
        {ability?.can('write', 'admin_subjects') ? (
          <>
            <Button
              variant='tonal'
              size='small'
              onClick={() => {
                handleClickEditExam(row.original)
              }}
              startIcon={<Icon icon='tabler:edit' fontSize={20} />}
            >
              <Translations text='Edit' />
            </Button>
            <Button
              variant='tonal'
              color='error'
              size='small'
              onClick={() => {
                handleShowExamDialog(row.original.id)
              }}
              startIcon={<Icon icon='tabler:trash' fontSize={20} />}
            >
              <Translations text='Delete' />
            </Button>
          </>
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
        open={show}
        maxWidth='md'
        scroll='body'
        onClose={() => setShow(false)}
        TransitionComponent={Transition}
        onBackdropClick={() => setShow(false)}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogContent
          sx={{
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            py: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <CustomCloseButton onClick={() => setShow(false)}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <Typography variant='h4' sx={{ mb: 4, textAlign: 'center' }}>
            <Translations text='AddExam' />
          </Typography>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <CustomAutocomplete
                id='name'
                freeSolo
                autoSelect
                fullWidth
                value={formData.name}
                options={['Midterm', 'Synag', 'Экзамен']}
                onChange={(event: SyntheticEvent, newValue: string | null) => {
                  handleFormChange('name', newValue)
                }}
                noOptionsText={t('NoRows')}
                renderOption={(props, item) => (
                  <li {...props} key={item}>
                    <ListItemText>{item}</ListItemText>
                  </li>
                )}
                getOptionLabel={option => option || ''}
                renderInput={params => <CustomTextField {...params} label={t('Name')} />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomAutocomplete
                id='teacher_id'
                value={teacher}
                options={teachers}
                loading={users_lite_list.loading}
                loadingText={t('ApiLoading')}
                onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                  setTeacher(newValue)
                  if (newValue) {
                    handleFormChange('teacher_id', newValue.key)
                  } else {
                    handleFormChange('teacher_id', null)
                  }
                }}
                noOptionsText={t('NoRows')}
                renderOption={(props, item) => (
                  <li {...props} key={item.key}>
                    <ListItemText>{item.value}</ListItemText>
                  </li>
                )}
                getOptionLabel={option => option.value || ''}
                renderInput={params => <CustomTextField {...params} required label={t('ExamTeacher')} />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePickerWrapper>
                <DatePicker
                  locale='tm'
                  id='start_time'
                  autoComplete='off'
                  showTimeSelect
                  showYearDropdown
                  showMonthDropdown
                  timeFormat='HH:mm'
                  timeIntervals={15}
                  selected={date}
                  calendarStartDay={1}
                  dateFormat='dd.MM.yyyy HH:mm'
                  onKeyDown={e => {
                    e.preventDefault()
                  }}
                  onChange={(date: Date | null) => {
                    setDate(date)
                    handleFormChange('start_time', date ? date.toISOString() : null)
                  }}
                  customInput={<CustomInput label={t('StartTime') as string} />}
                />
              </DatePickerWrapper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                id='time_length_min'
                fullWidth
                type='number'
                inputProps={{
                  min: 0,
                  step: 5
                }}
                autoComplete='off'
                value={formData.time_length_min}
                onWheel={event => event.target instanceof HTMLElement && event.target.blur()}
                label={t('Duration') + ` (${t('Minute')})`}
                onChange={e => handleFormChange('time_length_min', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                id='room_number'
                fullWidth
                type='text'
                label={t('CabinetNumber')}
                autoComplete='off'
                value={formData.room_number}
                onChange={e => handleFormChange('room_number', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                type='text'
                label={t('ExamWeight')}
                value={formData.exam_weight_percent}
                onChange={e => {
                  const input = e.target.value
                  if (!input || !isNaN((input as any) - parseFloat(input))) {
                    handleFormChange('exam_weight_percent', e.target.value === '' ? '' : Number(e.target.value))
                  }
                }}
                InputProps={{
                  endAdornment: <InputAdornment position='end'>%</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                sx={{ marginTop: 3 }}
                label={t('ExamRequired')}
                control={
                  <Checkbox
                    name='is_required'
                    checked={isRequired}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setIsRequired(event.target.checked)
                      handleFormChange('is_required', event.target.checked)
                    }}
                  />
                }
              />
            </Grid>
          </Grid>
          <Box sx={{ pt: theme => `${theme.spacing(6.5)} !important`, textAlign: 'center' }}>
            <Button
              variant='contained'
              type='submit'
              onClick={() => {
                onSubmit(formData)
              }}
              sx={{ mr: 4 }}
              disabled={classroom_update.loading}
            >
              {classroom_update.loading ? (
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
            <Button variant='tonal' color='secondary' onClick={() => setShow(false)}>
              <Translations text='GoBack' />
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        fullWidth
        open={show2}
        maxWidth='md'
        scroll='body'
        onClose={() => setShow2(false)}
        TransitionComponent={Transition}
        onBackdropClick={() => setShow2(false)}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogContent
          sx={{
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            py: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <CustomCloseButton onClick={() => setShow2(false)}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <Typography variant='h4' sx={{ mb: 4, textAlign: 'center' }}>
            <Translations text='SubjectExamInformation' />
          </Typography>
          {activeExam !== null && (
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='Name' />
                </Typography>
                <Typography>{activeExam.name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='ExamTeacher' />
                </Typography>
                <Typography
                  component={Link}
                  href={`/users/view/${activeExam.teacher?.id}`}
                  color={'primary.main'}
                  sx={{ fontWeight: '600', textDecoration: 'none' }}
                >
                  {renderUserFullname(
                    activeExam.teacher?.last_name,
                    activeExam.teacher?.first_name,
                    activeExam.teacher?.middle_name
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='StartTime' />
                </Typography>
                <Typography>
                  {activeExam.start_time && format(new Date(activeExam.start_time), 'dd.MM.yyyy HH:mm')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='Duration' />
                </Typography>
                {activeExam.time_length_min && (
                  <Typography>
                    {activeExam.time_length_min} {t('Minute')}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='CabinetNumber' />
                </Typography>
                <Typography>{activeExam.room_number}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='ExamWeight' />
                </Typography>
                <Typography>{activeExam.exam_weight_percent + ' %'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='ExamRequired' />
                </Typography>
                <Typography>
                  {activeExam.is_required === true ? (
                    <Icon fontSize='1.25rem' icon='tabler:check' />
                  ) : (
                    <Icon fontSize='1.25rem' icon='tabler:x' />
                  )}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={t('ExamsOfGroup')}
            action={
              ability.can('write', 'admin_classrooms') ? (
                <Button
                  variant='tonal'
                  onClick={() => handleClickAddExam()}
                  startIcon={<Icon icon='tabler:plus' fontSize={20} />}
                >
                  <Translations text='AddExam' />
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

export default GroupExamsCard
