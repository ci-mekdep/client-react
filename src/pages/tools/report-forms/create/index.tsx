// ** React Imports
import {
  ChangeEvent,
  FormEvent,
  ReactElement,
  Ref,
  SyntheticEvent,
  forwardRef,
  useEffect,
  useMemo,
  useState
} from 'react'

// ** MUI Imports
import {
  Box,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Fade,
  FadeProps,
  IconButton,
  IconButtonProps,
  ListItemText,
  MenuItem,
  Tooltip,
  Typography,
  styled
} from '@mui/material'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Component Import
import CustomTextField from 'src/shared/components/mui/text-field'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Store Imports
import { fetchSchoolsLite } from 'src/features/store/apps/school'

// ** Utils Imports

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import { useSelector } from 'react-redux'
import { ReportFormCreateType, SettingsReportFormKeyType } from 'src/entities/app/ReportFormType'
import { addReportForm } from 'src/features/store/apps/tools/reportForms'
import CustomChip from 'src/shared/components/mui/chip'
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import { renderQuestionType } from 'src/features/utils/ui/renderQuestionType'
import { convertQuestionTable } from 'src/features/utils/convertQuestionTable'
import { fetchSettingsReport } from 'src/features/store/apps/settings/report'
import useKeyboardSubmit from 'src/features/hooks/useKeyboardSubmit'

type RowType = {
  id: string
  key: string | null
  header: string
  type: string
  type_options: string[] | null
  parent_id?: string | null
  parent?: RowType | null
}

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

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

const defaultValues: ReportFormCreateType = {
  title: '',
  description: '',
  value_types: [],
  school_ids: [],
  is_pinned: false,
  is_center_rating: false,
  is_classrooms_included: false
}

const defaultRowValue: RowType = {
  id: '',
  key: null,
  header: '',
  type: 'text',
  type_options: null,
  parent_id: null,
  parent: null
}

const ReportFormCreate = () => {
  // ** State
  let inputRef: any
  const [show, setShow] = useState<boolean>(false)
  const [show2, setShow2] = useState<boolean>(false)
  const [selectedQuestion, setSelectedQuestion] = useState<SettingsReportFormKeyType | null>(null)
  const [dialogData, setDialogData] = useState<RowType>(defaultRowValue)
  const [tableData, setTableData] = useState<RowType[]>([])
  const [selectedSchools, setSelectedSchools] = useState<LiteModelType[]>([])
  const [schools, setSchools] = useState<LiteModelType[]>([])
  const [formData, setFormData] = useState<ReportFormCreateType>(defaultValues)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { report_form_add } = useSelector((state: RootState) => state.reportForms)
  const { report_keys } = useSelector((state: RootState) => state.settingsReport)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)

  useEffect(() => {
    dispatch(
      fetchSchoolsLite({
        limit: 750,
        offset: 0,
        is_select: true
      })
    )
    dispatch(fetchSettingsReport({}))
  }, [dispatch])

  useEffect(() => {
    if (!schools_lite_list.loading && schools_lite_list.status === 'success') {
      const allSchools = [{ key: '', value: 'Ählisi' }, ...schools_lite_list.data]
      setSchools(allSchools)
    }
  }, [schools_lite_list])

  useEffect(() => {
    if (show2 === true) {
      setTimeout(() => {
        inputRef?.focus()
      }, 100)
    }
  }, [inputRef, show2])

  const handleCloseDialog = () => {
    setShow(false)
    setDialogData(defaultRowValue)
  }

  const handleCloseSecondDialog = () => {
    setShow2(false)
  }

  const handleFormChange = (
    field: keyof ReportFormCreateType,
    value: ReportFormCreateType[keyof ReportFormCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleDialogFormChange = (field: keyof RowType, value: RowType[keyof RowType]) => {
    setDialogData({ ...dialogData, [field]: value })
  }

  const onSubmit = (
    event: FormEvent<HTMLFormElement> | null,
    data: ReportFormCreateType,
    is_list: boolean | string
  ) => {
    event?.preventDefault()

    const tableKeys = convertQuestionTable(tableData)
    const dataToSend = { ...data, value_types: tableKeys }

    dispatch(addReportForm(dataToSend))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        if (is_list === 'new') {
          router.replace(router.asPath)
          setShow(false)
          setShow2(false)
          setSelectedQuestion(null)
          setDialogData(defaultRowValue)
          setTableData([])
          setSelectedSchools([])
          setSchools([])
          setFormData(defaultValues)
        } else {
          router.push(is_list === true ? '/tools/report-forms' : `/tools/report-forms/view/${res.report.id}/submit`)
        }
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
      })
  }

  const columns = useMemo<MRT_ColumnDef<RowType>[]>(
    () => [
      {
        accessorKey: 'header',
        accessorFn: row => row.header,
        id: 'header',
        header: t('Question'),
        minSize: 600,
        Cell: ({ row }) => <Typography>{row.original.header}</Typography>
      },
      {
        accessorKey: 'type',
        accessorFn: row => row.type,
        id: 'type',
        header: t('QuestionType'),
        Cell: ({ row }) => (
          <Tooltip
            arrow
            placement='bottom-start'
            title={
              row.original.type_options && row.original.type_options.length > 0 ? (
                <Box display='flex' flexDirection='column'>
                  {row.original.type_options.map((option: string, index: number) => (
                    <Typography key={index} color='inherit'>
                      {option}
                    </Typography>
                  ))}
                </Box>
              ) : null
            }
          >
            <Box>
              <CustomChip rounded label={renderQuestionType(row.original.type)} skin='light' color='primary' />
            </Box>
          </Tooltip>
        )
      }
    ],
    [t]
  )

  const rootData = useMemo(() => tableData.filter(r => !r.parent_id), [tableData])

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableExpanding: true,
    enableExpandAll: true,
    enableRowActions: true,
    enableStickyHeader: true,
    enableHiding: false,
    enableEditing: false,
    enableSorting: false,
    enableGrouping: false,
    enableRowNumbers: false,
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
    displayColumnDefOptions: { 'mrt-row-actions': { maxSize: 200, grow: false } },
    positionActionsColumn: 'last',
    columns,
    data: rootData ? rootData : [],
    getSubRows: row => tableData.filter(r => r.parent_id === row.id),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
        {row.original.parent_id === null && (
          <Button
            variant='tonal'
            size='small'
            onClick={() => {
              setDialogData({ ...defaultRowValue, parent_id: row.original.id })
              setShow(true)
            }}
            startIcon={<Icon icon='tabler:plus' fontSize={20} />}
          >
            <Translations text='Add' />
          </Button>
        )}
        <Button
          variant='tonal'
          size='small'
          onClick={() => {
            setDialogData(row.original)
            setShow(true)
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
            setTableData(prev => prev.filter(item => item.id !== row.original.id && item.parent_id !== row.original.id))
          }}
          startIcon={<Icon icon='tabler:trash' fontSize={20} />}
        >
          <Translations text='Delete' />
        </Button>
      </Box>
    ),
    initialState: {
      expanded: true
    },
    state: {
      density: 'compact'
    }
  })

  const handleSubmit = () => {
    onSubmit(null, formData, 'new')
  }

  const handleSubmitAndList = () => {
    onSubmit(null, formData, false)
  }

  useKeyboardSubmit(handleSubmit, handleSubmitAndList)

  return (
    <>
      <Dialog
        fullWidth
        open={show2}
        maxWidth='md'
        scroll='body'
        onClose={() => handleCloseSecondDialog()}
        TransitionComponent={Transition}
        onBackdropClick={() => handleCloseSecondDialog()}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(15)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <CustomCloseButton onClick={() => handleCloseSecondDialog()}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <Typography variant='h3' textAlign='center' fontWeight={600} sx={{ mb: 8 }}>
            <Translations text='SampleQuestionSelect' />
          </Typography>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <CustomAutocomplete
                id='header'
                openOnFocus
                value={selectedQuestion}
                options={report_keys.data}
                loading={report_keys.loading}
                loadingText={t('ApiLoading')}
                onChange={(event: SyntheticEvent, newValue: SettingsReportFormKeyType | null) => {
                  setSelectedQuestion(newValue)
                  if (newValue) {
                    const newObj = {
                      header: newValue.header,
                      id: newValue.key,
                      key: newValue.key,
                      parent: null,
                      parent_id: null,
                      type: newValue.type,
                      type_options: null,
                      group: null
                    }
                    setDialogData(newObj)
                  }
                  handleCloseSecondDialog()
                }}
                noOptionsText={t('NoRows')}
                renderOption={(props, item) => (
                  <li {...props} key={item.key}>
                    <ListItemText>{item.header}</ListItemText>
                  </li>
                )}
                getOptionDisabled={option => tableData.some(data => data.key === option.key)}
                getOptionLabel={option => option.header || ''}
                renderInput={params => (
                  <CustomTextField
                    {...params}
                    inputRef={input => {
                      inputRef = input
                    }}
                    label={t('Question')}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <Dialog
        fullWidth
        open={show}
        maxWidth='md'
        scroll='body'
        onClose={() => handleCloseDialog()}
        TransitionComponent={Transition}
        onBackdropClick={() => handleCloseDialog()}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DatePickerWrapper>
          <DialogContent
            sx={{
              pb: theme => `${theme.spacing(8)} !important`,
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <CustomCloseButton onClick={() => handleCloseDialog()}>
              <Icon icon='tabler:x' fontSize='1.25rem' />
            </CustomCloseButton>
            <Typography variant='h3' textAlign='center' fontWeight={600} sx={{ mb: 8 }}>
              <Translations text='AddQuestion' />
            </Typography>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <CustomTextField
                  required
                  fullWidth
                  label={t('Question')}
                  value={dialogData.header}
                  onChange={e => handleDialogFormChange('header', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  select
                  required
                  fullWidth
                  label={t('QuestionType')}
                  SelectProps={{
                    value: dialogData.type,
                    onChange: e => handleDialogFormChange('type', e.target.value as string)
                  }}
                >
                  <MenuItem value='text'>
                    <Translations text='TextInputType' />
                  </MenuItem>
                  <MenuItem value='number'>
                    <Translations text='NumberInputType' />
                  </MenuItem>
                  <MenuItem value='select'>
                    <Translations text='SelectInputType' />
                  </MenuItem>
                  <MenuItem value='list'>
                    <Translations text='ListInputType' />
                  </MenuItem>
                </CustomTextField>
              </Grid>
              {dialogData.type === 'select' && (
                <Grid item xs={12}>
                  <CustomAutocomplete
                    id='options'
                    size='small'
                    freeSolo
                    multiple
                    fullWidth
                    value={dialogData.type_options ? dialogData.type_options : []}
                    options={[]}
                    onChange={(e: any, v: string[]) => {
                      handleDialogFormChange(
                        'type_options',
                        v.map(item => item)
                      )
                    }}
                    disableCloseOnSelect={true}
                    isOptionEqualToValue={(option, value) => option === value}
                    getOptionLabel={option => option}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => (
                      <li {...props} key={item}>
                        <ListItemText>{item}</ListItemText>
                      </li>
                    )}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label={t('SelectAnswers')}
                        helperText={'Jogaplary bir-birden ýazyp Enter basyň.'}
                      />
                    )}
                    renderTags={(value: string[], getTagProps) =>
                      value.map((option: string, index: number) => (
                        <CustomChip
                          rounded
                          skin='light'
                          color='primary'
                          sx={{ m: 0.5 }}
                          label={option}
                          {...(getTagProps({ index }) as {})}
                          key={index}
                        />
                      ))
                    }
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
        </DatePickerWrapper>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button
            variant='tonal'
            onClick={() => {
              setSelectedQuestion(null)
              setShow2(true)
            }}
          >
            <Translations text='SampleQuestions' />
          </Button>
          <Button
            variant='contained'
            onClick={() => {
              if (tableData.some(data => data.id === dialogData.id) && tableData.length !== 0) {
                const updatedArr = tableData.map(item => {
                  if (item.id === dialogData.id) {
                    return { ...dialogData }
                  }

                  return item
                })

                setTableData(updatedArr)
              } else {
                setTableData(prev => [...prev, { ...dialogData, id: Math.random().toString(36).substr(2, 9) }])
              }
              handleCloseDialog()
            }}
          >
            <Translations text='Submit' />
          </Button>
        </DialogActions>
      </Dialog>
      <>
        <form
          autoComplete='off'
          onSubmit={e => {
            onSubmit(e, formData, false)
          }}
        >
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title={t('ReportFormInformation')} />
                <Divider />
                <CardContent>
                  <Grid container spacing={6}>
                    <Grid item xs={12} sm={12}>
                      <CustomTextField
                        fullWidth
                        label={t('Name')}
                        value={formData.title}
                        onChange={e => handleFormChange('title', e.target.value)}
                        {...(errors && errors['title']
                          ? { error: true, helperText: errorTextHandler(errors['title']) }
                          : null)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      <CustomTextField
                        fullWidth
                        rows={5}
                        multiline
                        label={t('Description')}
                        value={formData.description}
                        onChange={e => handleFormChange('description', e.target.value)}
                        inputProps={{ style: { resize: 'vertical' } }}
                        {...(errors && errors['description']
                          ? { error: true, helperText: errorTextHandler(errors['description']) }
                          : null)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      <CustomAutocomplete
                        id='school_ids'
                        size='small'
                        multiple
                        fullWidth
                        value={selectedSchools}
                        options={schools}
                        loading={schools_lite_list.loading}
                        loadingText={t('ApiLoading')}
                        onChange={(e: any, v: LiteModelType[]) => {
                          setSelectedSchools(v)
                          handleFormChange(
                            'school_ids',
                            v.map(item => item.key)
                          )
                        }}
                        disableCloseOnSelect={true}
                        isOptionEqualToValue={(option, value) => option.key === value.key}
                        getOptionLabel={option => option.value}
                        noOptionsText={t('NoRows')}
                        renderOption={(props, item) => (
                          <li {...props} key={item.key}>
                            <ListItemText>{item.value}</ListItemText>
                          </li>
                        )}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            label={t('Schools')}
                            {...(errors && errors['school_ids']
                              ? { error: true, helperText: errorTextHandler(errors['school_ids']) }
                              : null)}
                          />
                        )}
                        renderTags={(value: LiteModelType[], getTagProps) =>
                          value.map((option: LiteModelType, index: number) => (
                            <CustomChip
                              rounded
                              skin='light'
                              color='primary'
                              sx={{ m: 0.5 }}
                              label={option.value}
                              {...(getTagProps({ index }) as {})}
                              key={index}
                            />
                          ))
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box
                        onClick={() => {
                          handleFormChange(
                            'is_pinned',
                            formData.is_pinned === true ? false : formData.is_pinned === false ? true : true
                          )
                        }}
                        sx={{
                          px: 4,
                          py: 2,
                          display: 'flex',
                          borderRadius: 1,
                          cursor: 'pointer',
                          position: 'relative',
                          alignItems: 'flex-start',
                          border: theme =>
                            `1px solid ${
                              formData.is_pinned === true ? theme.palette.primary.main : theme.palette.divider
                            }`,
                          '&:hover': {
                            borderColor: theme =>
                              `rgba(${
                                formData.is_pinned === true
                                  ? theme.palette.primary.light
                                  : theme.palette.customColors.main
                              }, 0.25)`
                          }
                        }}
                      >
                        <Checkbox
                          size='small'
                          name='is_pinned'
                          checked={formData.is_pinned}
                          sx={{ mb: -2, mt: -2.5, ml: -2.75 }}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            handleFormChange('is_pinned', event.target.checked === true)
                          }}
                        />
                        <Translations text='PinReportForm' />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box
                        onClick={() => {
                          handleFormChange(
                            'is_center_rating',
                            formData.is_center_rating === true
                              ? false
                              : formData.is_center_rating === false
                              ? true
                              : true
                          )
                        }}
                        sx={{
                          px: 4,
                          py: 2,
                          display: 'flex',
                          borderRadius: 1,
                          cursor: 'pointer',
                          position: 'relative',
                          alignItems: 'flex-start',
                          border: theme =>
                            `1px solid ${
                              formData.is_center_rating === true ? theme.palette.primary.main : theme.palette.divider
                            }`,
                          '&:hover': {
                            borderColor: theme =>
                              `rgba(${
                                formData.is_center_rating === true
                                  ? theme.palette.primary.light
                                  : theme.palette.customColors.main
                              }, 0.25)`
                          }
                        }}
                      >
                        <Checkbox
                          size='small'
                          name='is_center_rating'
                          checked={formData.is_center_rating}
                          sx={{ mb: -2, mt: -2.5, ml: -2.75 }}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            handleFormChange('is_center_rating', event.target.checked === true)
                          }}
                        />
                        <Translations text='CenterRating' />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box
                        onClick={() => {
                          handleFormChange(
                            'is_classrooms_included',
                            formData.is_classrooms_included === true
                              ? false
                              : formData.is_classrooms_included === false
                              ? true
                              : true
                          )
                        }}
                        sx={{
                          px: 4,
                          py: 2,
                          display: 'flex',
                          borderRadius: 1,
                          cursor: 'pointer',
                          position: 'relative',
                          alignItems: 'flex-start',
                          border: theme =>
                            `1px solid ${
                              formData.is_classrooms_included === true
                                ? theme.palette.primary.main
                                : theme.palette.divider
                            }`,
                          '&:hover': {
                            borderColor: theme =>
                              `rgba(${
                                formData.is_classrooms_included === true
                                  ? theme.palette.primary.light
                                  : theme.palette.customColors.main
                              }, 0.25)`
                          }
                        }}
                      >
                        <Checkbox
                          size='small'
                          name='is_classrooms_included'
                          checked={formData.is_classrooms_included}
                          sx={{ mb: -2, mt: -2.5, ml: -2.75 }}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            handleFormChange('is_classrooms_included', event.target.checked === true)
                          }}
                        />
                        <Translations text='ReportFormByClassrooms' />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={t('Questions')}
                  action={
                    <Button
                      variant='contained'
                      onClick={() => {
                        setDialogData(defaultRowValue)
                        setShow(true)
                      }}
                      startIcon={<Icon icon='tabler:plus' fontSize={20} />}
                    >
                      <Translations text='AddQuestion' />
                    </Button>
                  }
                />
                <Divider />
                <CardContent sx={{ p: '0 !important' }}>
                  <MaterialReactTable table={table} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
              <Button variant='contained' sx={{ mr: 4 }} disabled={report_form_add.loading} type='submit'>
                {report_form_add.loading ? (
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
                variant='contained'
                sx={{ mr: 4 }}
                disabled={report_form_add.loading}
                onClick={() => {
                  onSubmit(null, formData, true)
                }}
              >
                {report_form_add.loading ? (
                  <CircularProgress
                    sx={{
                      width: '20px !important',
                      height: '20px !important',
                      mr: theme => theme.spacing(2)
                    }}
                  />
                ) : null}
                <Translations text='SubmitAndList' />
              </Button>
              <Button variant='tonal' color='secondary' onClick={() => router.back()}>
                <Translations text='GoBack' />
              </Button>
            </Grid>
          </Grid>
        </form>
      </>
    </>
  )
}

ReportFormCreate.acl = {
  action: 'write',
  subject: 'tool_report_forms'
}

export default ReportFormCreate
