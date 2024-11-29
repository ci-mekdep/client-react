import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  IconButtonProps,
  LinearProgress,
  Typography,
  styled
} from '@mui/material'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import { AppDispatch, RootState } from 'src/features/store'
import { fetchReportsDetails } from 'src/features/store/apps/tools/reports'
import { fetchReportJournalDetails } from 'src/features/store/apps/tools/reports/journal'
import { fetchReportParentsDetails } from 'src/features/store/apps/tools/reports/parents'
import { fetchReportPeriodsDetails } from 'src/features/store/apps/tools/reports/periods'
import { fetchReportAttendanceDetails } from 'src/features/store/apps/tools/reports/attendance'
import Icon from 'src/shared/components/icon'
import { fetchReportExamsDetails } from 'src/features/store/apps/tools/reports/exams'
import { fetchReportStudentsDetails } from 'src/features/store/apps/tools/reports/students'
import dataTableConfig from 'src/app/configs/dataTableConfig'

interface ActiveDetailType {
  school: string
  school_id: string | null
  user_id: string | null
}

interface ReportDetailProps {
  quarter: string | null
  date: (string | null)[]
  activeDetail: ActiveDetailType | null
  currentReport: string
  dialogOpen: boolean
  handleClose: () => void
  handleOpenDialog: (school: string, school_id: string | null, user_id: string | null) => void
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

const ReportDetailDialog = (props: ReportDetailProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [data, setData] = useState<any[]>([])
  const [hasDetails, setHasDetails] = useState<boolean>(false)
  const [headers, setHeaders] = useState<string[]>([])

  // ** Props
  const { quarter, date, activeDetail, currentReport, dialogOpen, handleClose, handleOpenDialog } = props

  const dispatch = useDispatch<AppDispatch>()
  const { reports_details } = useSelector((state: RootState) => state.reports)
  const { report_journal_details } = useSelector((state: RootState) => state.reportJournal)
  const { report_parents_details } = useSelector((state: RootState) => state.reportParents)
  const { report_attendance_details } = useSelector((state: RootState) => state.reportAttendance)
  const { report_periods_details } = useSelector((state: RootState) => state.reportPeriods)
  const { report_exams_details } = useSelector((state: RootState) => state.reportExams)
  const { report_students_details } = useSelector((state: RootState) => state.reportStudents)

  useEffect(() => {
    if (currentReport === 'data') {
      dispatch(
        fetchReportsDetails({
          school_id: activeDetail?.school_id,
          ...(activeDetail?.user_id && { user_id: activeDetail?.user_id })
        })
      )
    }
    if (currentReport === 'period') {
      dispatch(
        fetchReportPeriodsDetails({
          period_number: quarter as string,
          school_id: activeDetail?.school_id,
          ...(activeDetail?.user_id && { user_id: activeDetail?.user_id })
        })
      )
    }
    if (currentReport === 'journal') {
      const params: any = {
        school_id: activeDetail?.school_id,
        ...(activeDetail?.user_id && { user_id: activeDetail?.user_id })
      }
      if (quarter) {
        params.period_number = quarter as string
      } else {
        if (date[0] !== null) {
          params.start_date = date[0]
        }
        if (date[1] !== null) {
          params.end_date = date[1]
        }
      }
      dispatch(fetchReportJournalDetails(params))
    }
    if (currentReport === 'attendance') {
      const params: any = {
        school_id: activeDetail?.school_id,
        ...(activeDetail?.user_id && { user_id: activeDetail?.user_id })
      }
      if (date[0] !== null) {
        params.start_date = date[0]
      }
      if (date[1] !== null) {
        params.end_date = date[1]
      }
      dispatch(fetchReportAttendanceDetails(params))
    }
    if (currentReport === 'parents') {
      dispatch(
        fetchReportParentsDetails({
          school_id: activeDetail?.school_id,
          ...(activeDetail?.user_id && { user_id: activeDetail?.user_id })
        })
      )
    }
    if (currentReport === 'exams') {
      dispatch(
        fetchReportExamsDetails({
          school_id: activeDetail?.school_id,
          ...(activeDetail?.user_id && { user_id: activeDetail?.user_id })
        })
      )
    }
    if (currentReport === 'students') {
      dispatch(
        fetchReportStudentsDetails({
          school_id: activeDetail?.school_id,
          ...(activeDetail?.user_id && { user_id: activeDetail?.user_id })
        })
      )
    }
  }, [activeDetail, currentReport, date, dispatch, quarter])

  const generateTableData = (data: any) => {
    const headers: any = {}
    data.headers.map((header: string, index: number) => {
      headers[`key${index + 1}`] = header
      headers['school_id'] = 'ID'
      headers['user_id'] = 'user_id'
    })
    setHeaders(headers)

    const arr: any = []
    data.rows.map((row: any) => {
      let obj: any = {}
      row.values.map((v: string, i: number) => {
        obj[`key${i + 1}`] = /^\d+$/.test(v) ? parseInt(v) : v
        obj['school_id'] = row.school_id
        obj['user_id'] = row.user_id
      })
      arr.push(obj)
      obj = {}
    })
    setData(arr)
    setHasDetails(data.has_detail)
  }

  const getDataByType = (s: string) => {
    switch (s) {
      case 'data':
        return reports_details.data
        break
      case 'journal':
        return report_journal_details.data
        break
      case 'period':
        return report_periods_details.data
        break
      case 'attendance':
        return report_attendance_details.data
        break
      case 'parents':
        return report_parents_details.data
        break
      case 'exams':
        return report_exams_details.data
        break
      case 'students':
        return report_students_details.data
        break
      default:
        return null
        break
    }
  }

  useEffect(() => {
    switch (currentReport) {
      case 'data':
        setIsLoading(reports_details.loading)
        break
      case 'journal':
        setIsLoading(report_journal_details.loading)
        break
      case 'period':
        setIsLoading(report_periods_details.loading)
        break
      case 'attendance':
        setIsLoading(report_attendance_details.loading)
        break
      case 'parents':
        setIsLoading(report_parents_details.loading)
        break
      case 'exams':
        setIsLoading(report_exams_details.loading)
        break
      case 'students':
        setIsLoading(report_students_details.loading)
        break
      default:
        setIsLoading(false)
        break
    }
  }, [
    currentReport,
    report_attendance_details.loading,
    report_journal_details.loading,
    report_parents_details.loading,
    report_periods_details.loading,
    report_exams_details.loading,
    report_students_details.loading,
    reports_details.loading
  ])

  useEffect(() => {
    const currentData = getDataByType(currentReport)
    if (isLoading === false) {
      generateTableData(currentData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentReport, isLoading])

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () =>
      data.length
        ? Object.keys(data[0]).map(columnId => ({
            header: headers[columnId as any] ?? columnId,
            accessorKey: columnId,
            id: columnId,
            ...(headers[columnId as any] && headers[columnId as any].includes('%')
              ? {
                  minSize: 230
                }
              : {}),
            Cell: ({ cell }: { cell: any }) => {
              if (headers[columnId as any] && headers[columnId as any].includes('%')) {
                return (
                  <Box display={'flex'} alignItems={'center'}>
                    <LinearProgress
                      color='primary'
                      value={cell.getValue()}
                      variant='determinate'
                      sx={{
                        height: 8,
                        width: 160,
                        borderRadius: 8
                      }}
                    />
                    <Typography ml={3}>{`${cell.getValue()}%`}</Typography>
                  </Box>
                )
              } else {
                return cell.getValue()
              }
            }
          }))
        : [],
    [data, headers]
  )

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableSorting: true,
    enableRowNumbers: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableRowActions: hasDetails ? true : false,
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
      padding: 'none'
    },
    muiTablePaperProps: { sx: { boxShadow: 'none!important' } },
    muiToolbarAlertBannerChipProps: { color: 'primary' },
    muiTableContainerProps: { sx: { maxHeight: '80vh' } },
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box display='flex' alignItems='center' justifyContent='center'>
        <IconButton
          size='small'
          onClick={() => {
            handleOpenDialog(row.original.key1, row.original.school_id, row.original.user_id)
          }}
          sx={{ color: 'text.secondary' }}
        >
          <Icon icon='tabler:eye' fontSize={20} />
        </IconButton>
      </Box>
    ),
    columns,
    data: data,
    initialState: {
      density: 'compact'
    },
    state: { isLoading: isLoading, columnVisibility: { school_id: false, user_id: false } }
  })

  return (
    <>
      <Dialog
        fullWidth
        maxWidth='xl'
        open={dialogOpen}
        onClose={handleClose}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogContent
          sx={{
            px: 0,
            pb: 0,
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <CustomCloseButton onClick={() => handleClose()}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          {!isLoading ? (
            <>
              <Typography variant='h4' textAlign='center' fontWeight={600} marginBottom={5}>
                {activeDetail?.school}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'left',
                  justifyContent: 'left',
                  flexDirection: 'column'
                }}
              >
                <MaterialReactTable table={table} />
              </Box>
            </>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '20vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ReportDetailDialog
