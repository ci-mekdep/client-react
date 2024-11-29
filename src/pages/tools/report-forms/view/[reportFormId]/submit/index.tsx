// ** React Imports
import { FormEvent, forwardRef, ReactElement, Ref, useContext, useEffect, useMemo, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'

// ** Custom Components Import
import Icon from 'src/shared/components/icon'
import CustomAvatar from 'src/shared/components/mui/avatar'

// ** Types

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Box,
  Button,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  Fade,
  FadeProps,
  IconButton,
  IconButtonProps,
  ListItemText,
  MenuItem,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableCellBaseProps,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import {
  deleteReportForm,
  fetchUnfilledReportForms,
  getCurrentReportForm,
  submitReportForm
} from 'src/features/store/apps/tools/reportForms'
import Translations from 'src/app/layouts/components/Translations'
import { useAuth } from 'src/features/hooks/useAuth'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { ReportFormItemType, ReportFormRowType, ReportFormSubmitType } from 'src/entities/app/ReportFormType'
import CustomTextField from 'src/shared/components/mui/text-field'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import CustomChip from 'src/shared/components/mui/chip'
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import format from 'date-fns/format'
import { Tooltip as ChartTooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { useDialog } from 'src/app/context/DialogContext'

type RowType = {
  key: string
  type?: string
  is_edited?: boolean
  value: string
}

type ChartPieDataType = {
  name: string
  values: string
  total: number
  color: string
}

interface LabelProp {
  cx: number
  cy: number
  percent: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  payload: any
}

const RADIAN = Math.PI / 180
const renderCustomizedLabel = (props: LabelProp) => {
  // ** Props
  const { cx, cy, midAngle, innerRadius, outerRadius, payload } = props
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill='#fff' textAnchor='middle' dominantBaseline='central'>
      {payload.name}
    </text>
  )
}

const CustomTooltip = (props: any) => {
  if (!props.active || !props.payload) return null

  return (
    <Card sx={{ border: theme => `1px solid ${theme.palette.divider}`, p: 3 }}>
      <Typography>
        <Translations text='Total' />: {props.payload[0]?.payload.values}
      </Typography>
    </Card>
  )
}

const MUITableCell = styled(TableCell)<TableCellBaseProps>(({ theme }) => ({
  '&:not(:first-of-type)': {
    borderLeft: `1px solid ${theme.palette.divider}`
  }
}))

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

const FormInput = ({
  values,
  row,
  handleEditResponse
}: {
  values: RowType[]
  row: ReportFormRowType
  handleEditResponse: (key: string, val: string, type: string) => void
}) => {
  const thisValue = values?.find(item => item.key === row.key)?.value
  const { t } = useTranslation()

  switch (row.type) {
    case 'text':
      return (
        <CustomTextField
          fullWidth
          required
          name={row.key}
          type='text'
          label={row.header}
          value={thisValue}
          onChange={e => {
            handleEditResponse(row.key, e.target.value, row.type)
          }}
        />
      )
    case 'number':
      return (
        <CustomTextField
          fullWidth
          required
          name={row.key}
          type='number'
          label={row.header}
          value={thisValue}
          onChange={e => {
            handleEditResponse(row.key, e.target.value, row.type)
          }}
          error={values?.find(item => item.key === row.key)?.is_edited === true}
        />
      )
    case 'select':
      return (
        <CustomTextField
          select
          fullWidth
          required
          defaultValue={thisValue}
          label={row.header}
          SelectProps={{
            value: thisValue,
            onChange: e => handleEditResponse(row.key, e.target.value as string, row.type)
          }}
        >
          {row.type_options?.map((opt, index) => (
            <MenuItem key={index} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </CustomTextField>
      )
    case 'list':
      return (
        <CustomAutocomplete
          id={row.key}
          size='small'
          freeSolo
          multiple
          fullWidth
          options={[]}
          value={thisValue ? thisValue.split(',') : []}
          onChange={(e: any, v: string[]) => {
            handleEditResponse(row.key, v.join(','), row.type)
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
              required={!thisValue}
              label={row.header}
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
      )
    default:
      return <></>
  }
}

const ReportFormChartView = () => {
  const [show, setShow] = useState<boolean>(false)
  const [isEditedManually, setIsEditedManually] = useState<boolean>(false)
  const [responses, setResponses] = useState<RowType[] | null>(null)
  const [summedResponses, setSummedResponses] = useState<RowType[] | null>(null)
  const [detailData, setDetailData] = useState<ReportFormItemType | null>(null)
  const [chartPieData, setChartPieData] = useState<ChartPieDataType[]>([])

  const router = useRouter()
  const { t } = useTranslation()
  const showDialog = useDialog()
  const id = router.query.reportFormId
  const ability = useContext(AbilityContext)
  const { current_role, current_school } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const { report_form_detail, report_form_submit } = useSelector((state: RootState) => state.reportForms)

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentReportForm(id as string))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (!report_form_detail.loading && report_form_detail.status === 'success' && report_form_detail.data) {
      const values = report_form_detail.data?.report_item?.values || []
      const arr =
        report_form_detail.data.value_types?.map((row, index) => ({
          key: row.key,
          type: row.type,
          is_edited: false,
          value: values[index] || ''
        })) || []
      setResponses(arr)

      const initialResponses =
        report_form_detail.data.value_types?.map((row, index) => ({
          key: row.key,
          type: row.type,
          is_edited: false,
          value: row.type === 'number' ? '' : values[index]
        })) || []

      report_form_detail.data.report_items.forEach(row => {
        row.values?.forEach((val, index) => {
          const currentResponse = initialResponses[index]
          if (val && currentResponse.type === 'number') {
            const oldVal = parseInt(currentResponse.value || '0')
            const newVal = oldVal + parseInt(val)
            currentResponse.value = newVal.toString()
          }
        })
      })

      setSummedResponses(initialResponses)

      const pieObj: any = {
        'Doldurylan sany': report_form_detail.data.items_filled_count,
        'Doldurylmadyk sany': report_form_detail.data.items_count - report_form_detail.data.items_filled_count
      }
      const colors = ['#007000', '#d2222d']
      const pieChartData = Object.entries(pieObj)
        .map(([key, value]: [any, any]) => ({
          name: key,
          values: value,
          total: value
        }))
        .map((item, index) => ({
          ...item,
          color: colors[Math.min(index, colors.length - 1)]
        }))

      setChartPieData(pieChartData)
    }
  }, [report_form_detail, t])

  const handleShowDialog = async (id: string) => {
    const confirmed = await showDialog()
    if (confirmed && id) {
      handleDeleteReportForm(id)
    }
  }

  const handleDeleteReportForm = async (id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteReportForm([id]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        router.push('/tools/report-forms')
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  const handleAutoFillResponses = () => {
    setResponses(summedResponses)
    setIsEditedManually(false)
    toast.success(t('ApiSuccessDefault'))
  }

  const handleEditResponse = (key: string, val: string, type: string) => {
    setResponses(
      prev =>
        prev &&
        prev.map(item =>
          item.key === key
            ? { ...item, is_edited: type === 'number' && current_role !== 'teacher' ? true : false, value: val }
            : item
        )
    )
    if (type === 'number') {
      setIsEditedManually(true)
    }
  }

  const handleCloseDialog = () => {
    setShow(false)
    setDetailData(null)
  }

  const handleShowDetails = (row: ReportFormItemType) => {
    setShow(true)
    setDetailData(row)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: RowType[] | null) => {
    event?.preventDefault()
    const dataToSend = {
      school_id: current_school?.id,
      values: data?.map(row => row.value),
      is_edited_manually: current_role !== 'teacher' ? isEditedManually : false
    }
    dispatch(
      submitReportForm({ data: dataToSend as ReportFormSubmitType, id: report_form_detail.data?.report_item?.id })
    )
      .unwrap()
      .then(() => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        dispatch(fetchUnfilledReportForms())
        router.push('/tools/report-forms')
      })
      .catch(err => {
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  const columns = useMemo<MRT_ColumnDef<ReportFormItemType>[]>(
    () => [
      {
        accessorKey: 'school',
        accessorFn: row => (row.classroom ? row.classroom.name : row.school.name),
        id: 'school',
        header: t('School'),
        Cell: ({ row }) => (
          <Box display='flex' alignItems='center' gap={3}>
            <Typography>{row.original.classroom ? row.original.classroom.name : row.original.school.name}</Typography>
            {row.original.values !== null && (
              <Tooltip
                placement='top'
                title={row.original.is_edited_manually === true ? t('EditedManually') : t('NotEditedManually')}
              >
                {row.original.is_edited_manually === true ? (
                  <CustomAvatar skin='light' color='warning' sx={{ width: 22, height: 22 }}>
                    <Icon icon='tabler:pencil' fontSize='1rem' />
                  </CustomAvatar>
                ) : (
                  <CustomAvatar skin='light' color='success' sx={{ width: 22, height: 22 }}>
                    <Icon icon='tabler:check' fontSize='1rem' />
                  </CustomAvatar>
                )}
              </Tooltip>
            )}
          </Box>
        )
      },
      {
        accessorKey: 'updated_user',
        accessorFn: row => row.updated_by_user?.last_name,
        id: 'updated_user',
        header: t('Teacher'),
        Cell: ({ row }) => (
          <Typography>
            {row.original.updated_by_user
              ? renderUserFullname(
                  row.original.updated_by_user.last_name,
                  row.original.updated_by_user.first_name,
                  row.original.updated_by_user.middle_name
                )
              : ''}
          </Typography>
        ),
        sortingFn: 'customSorting'
      },
      {
        accessorKey: 'updated_at',
        accessorFn: row => row.updated_at,
        id: 'updated_at',
        header: t('UpdatedTime'),
        Cell: ({ row }) => (
          <Typography>
            {row.original.updated_at && format(new Date(row.original.updated_at), 'dd.MM.yyyy HH:mm:ss')}
          </Typography>
        )
      },
      {
        accessorKey: 'is_filled',
        accessorFn: row => row.values === null,
        id: 'is_filled',
        header: t('Filled'),
        Cell: ({ row }) => (
          <CustomChip
            rounded
            size='small'
            label={row.original.values === null ? t('Unfilled') : t('Filled')}
            skin='light'
            color={row.original.values === null ? 'error' : 'success'}
          />
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
    positionActionsColumn: 'last',
    muiTableBodyCellProps: {
      padding: 'none'
    },
    muiTablePaperProps: { sx: { boxShadow: 'none!important' } },
    muiBottomToolbarProps: { sx: { paddingLeft: 4 } },
    muiTableContainerProps: { sx: { maxHeight: 'none', border: 'none' } },
    columns,
    data: report_form_detail.data?.report_items ? report_form_detail.data?.report_items : [],
    getRowId: row => (row?.id ? row.id.toString() : ''),
    muiToolbarAlertBannerProps: report_form_detail.error
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    renderBottomToolbarCustomActions: () => (
      <Typography sx={{ color: 'text.secondary' }}>
        <Translations text='Total' /> {report_form_detail.data.report_items?.length}.
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Button
          variant='tonal'
          size='small'
          startIcon={<Icon icon='tabler:eye' fontSize={20} />}
          onClick={() => handleShowDetails(row.original)}
        >
          <Translations text='View' />
        </Button>
      </Box>
    ),
    rowCount: report_form_detail.data.report_items?.length,
    state: {
      density: 'compact',
      isLoading: report_form_detail.loading
    }
  })

  if (report_form_detail.error) {
    return <Error error={report_form_detail.error} />
  }

  if (!report_form_detail.loading && report_form_detail.data && responses && id) {
    return (
      <>
        {detailData && (
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
            <DialogContent
              sx={{
                pb: theme => `${theme.spacing(15)} !important`,
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
              }}
            >
              <CustomCloseButton onClick={() => handleCloseDialog()}>
                <Icon icon='tabler:x' fontSize='1.25rem' />
              </CustomCloseButton>
              <Typography variant='h3' textAlign='center' fontWeight={600} sx={{ mb: 8 }}>
                {detailData?.classroom ? detailData?.classroom.name : detailData?.school.name}
              </Typography>
              <Card sx={{ height: '100%' }}>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} size='small' aria-label='simple table'>
                    <TableHead>
                      <TableRow>
                        <MUITableCell align='center'>
                          <Typography>
                            <Translations text='Question' />
                          </Typography>
                        </MUITableCell>
                        <MUITableCell align='center'>
                          <Typography>
                            <Translations text='Answer' />
                          </Typography>
                        </MUITableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report_form_detail.data?.value_types.map((row, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:last-of-type td, &:last-of-type th': {
                              borderBottom: 0
                            }
                          }}
                        >
                          <MUITableCell variant='head' align='left'>
                            <Typography>{row.header}</Typography>
                          </MUITableCell>
                          <MUITableCell variant='head' align='center'>
                            <Typography>{detailData?.values ? detailData?.values[index] : ''}</Typography>
                          </MUITableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </DialogContent>
          </Dialog>
        )}
        <form
          autoComplete='off'
          onSubmit={e => {
            onSubmit(e, responses)
          }}
        >
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={t('ReportFormInformation')}
                  action={
                    ability.can('write', 'tool_report_forms') && current_role === 'admin' ? (
                      <Box display='flex' gap='15px'>
                        <Button
                          variant='tonal'
                          component={Link}
                          href={`/tools/report-forms/edit/${report_form_detail.data.id}`}
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
                    <Grid item xs={12} sm={12}>
                      <Typography sx={{ color: 'text.secondary' }}>
                        <Translations text='Name' />
                      </Typography>
                      <Typography>{report_form_detail.data.title}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      <Typography sx={{ color: 'text.secondary' }}>
                        <Translations text='Description' />
                      </Typography>
                      <Typography>{report_form_detail.data.description}</Typography>
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
                    current_role !== 'teacher' && (
                      <Button
                        variant='tonal'
                        color='success'
                        onClick={handleAutoFillResponses}
                        startIcon={<Icon icon='tabler:wand' fontSize={20} />}
                      >
                        <Translations text='AutoFill' />
                      </Button>
                    )
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={6}>
                    {report_form_detail.data?.value_types?.map((row, index) => (
                      <Grid key={index} item xs={12}>
                        <FormInput values={responses} row={row} handleEditResponse={handleEditResponse} />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
              <Box
                sx={{
                  display: {
                    xs: 'block',
                    lg: 'flex'
                  },
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  alignContent: 'flex-end',
                  gap: 2
                }}
              >
                {isEditedManually === true && current_role !== 'teacher' && (
                  <Alert severity='warning'>
                    <Translations text='EditedManuallyWarningText' />
                  </Alert>
                )}
                <Box display='flex' justifyContent='end' gap={2} marginLeft='auto' marginTop={2}>
                  <Button variant='contained' disabled={report_form_submit.loading} type='submit'>
                    {report_form_submit.loading ? (
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
                  <Button variant='tonal' color='secondary' onClick={() => router.back()}>
                    <Translations text='GoBack' />
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={12} lg={6}>
              <Card>
                <CardHeader title={t('PieChartTitle')} />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer>
                      <PieChart height={350} style={{ direction: 'ltr' }}>
                        <Pie
                          data={chartPieData}
                          dataKey='total'
                          minAngle={10}
                          label={renderCustomizedLabel}
                          labelLine={false}
                        >
                          {chartPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={12} lg={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title={t('Details')}
                  action={
                    report_form_detail.data.is_center_rating === true && (
                      <Button
                        variant='tonal'
                        color='success'
                        component={Link}
                        href={`/tools/report-forms/view/${report_form_detail.data.id}/rating`}
                        startIcon={<Icon icon='tabler:chart-bar-popular' fontSize={20} />}
                      >
                        <Translations text='CenterRating' />
                      </Button>
                    )
                  }
                />
                <Divider />
                <CardContent sx={{ p: '0!important' }} data-cy='dashboard-birthday-card'>
                  <TableContainer component={Paper}>
                    <Table size='small' stickyHeader aria-label='sticky table'>
                      <TableBody>
                        <TableRow hover>
                          <TableCell align='left'>
                            <Typography>
                              <Translations text='QuestionsCount' />
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography>{report_form_detail.data.value_types?.length}</Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow hover>
                          <TableCell align='left'>
                            <Typography>
                              <Translations text='FilledCount' />
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography>{report_form_detail.data.items_filled_count} </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow hover>
                          <TableCell align='left'>
                            <Typography>
                              <Translations text='UnfilledCount' />
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography>
                              {report_form_detail.data.items_count !== null &&
                              report_form_detail.data.items_filled_count !== null
                                ? report_form_detail.data.items_count - report_form_detail.data.items_filled_count
                                : ''}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow hover>
                          <TableCell align='left'>
                            <Typography>
                              <Translations text='Total' />
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography>{report_form_detail.data.items_count}</Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            {current_role !== 'teacher' && (
              <Grid item xs={12}>
                <Card>
                  <CardHeader title={t('FormResponses')} />
                  <Divider />
                  <MaterialReactTable table={table} />
                </Card>
              </Grid>
            )}
          </Grid>
        </form>
      </>
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

ReportFormChartView.acl = {
  action: 'write',
  subject: 'tool_report_forms'
}

export default ReportFormChartView
