import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  IconButtonProps,
  LinearProgress,
  Typography,
  styled
} from '@mui/material'
import Link from 'next/link'
import format from 'date-fns/format'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import Icon from 'src/shared/components/icon'
import Translations from 'src/app/layouts/components/Translations'
import { useAuth } from 'src/features/hooks/useAuth'

import { exportToExcel } from 'src/features/utils/exportToExcel'
import { calculatePercentage } from 'src/features/utils/calculatePercentage'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'

import { RootState } from 'src/features/store'
import { DateType } from 'src/entities/app/GeneralTypes'
import { SchoolListType } from 'src/entities/school/SchoolType'
import dataTableConfig from 'src/app/configs/dataTableConfig'

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

interface PropsType {
  show: boolean
  startDate?: DateType
  endDate?: DateType
  school?: SchoolListType | null
  setShowTeacherDetail: (val: boolean) => void
  handleClose: () => void
  handleSelectTeacher: (val: any) => void
}

const DashboardAdminDetail = (props: PropsType) => {
  const [dashboardDataDetail, setDashboardDataDetail] = useState<any>(null)

  const show = props.show
  const startDate = props.startDate
  const endDate = props.endDate
  const school = props.school
  const setShowTeacherDetail = props.setShowTeacherDetail
  const handleClose = props.handleClose
  const handleSelectTeacher = props.handleSelectTeacher

  const { t } = useTranslation()
  const { current_role } = useAuth()
  const { dashboard_data_detail } = useSelector((state: RootState) => state.dashboards)

  useEffect(() => {
    if (!dashboard_data_detail.loading && dashboard_data_detail.status === 'success') {
      setDashboardDataDetail(dashboard_data_detail.data)
    }
  }, [dashboard_data_detail.data, dashboard_data_detail.loading, dashboard_data_detail.status])

  const convertDataByTeacherToExcel = () => {
    const transformedData = dashboardDataDetail.report_by_teacher.map((row: any) => {
      const obj: any = {}
      obj['Mugallym'] = renderUserFullname(row.teacher.last_name, row.teacher.first_name, row.teacher.middle_name)
      obj['Sagat sany'] = row.subject_percents.length
      obj['Doly'] = row.subject_percents.filter((x: any) => {
        return x.is_grade_full
      }).length
      obj['Doly däl'] = row.subject_percents.filter((x: any) => {
        return !x.is_grade_full
      }).length
      obj['Dolulyk'] =
        calculatePercentage(
          row.subject_percents.length,
          row.subject_percents.filter((x: any) => {
            return x.is_grade_full
          }).length
        ) + '%'

      return obj
    })

    const date =
      startDate && format(new Date(startDate), 'dd.MM.yyyy') + endDate
        ? ` - ${endDate && format(new Date(endDate), 'dd.MM.yyyy')}`
        : ''

    exportToExcel(`Žurnallaryň dolulygynyň hasabaty ${date}.xlsx`, transformedData)
  }

  const detailColumns = useMemo<MRT_ColumnDef<any>[]>(
    () =>
      current_role === 'admin' || current_role === 'organization'
        ? [
            {
              accessorKey: 'teacher',
              accessorFn: row => row.teacher.last_name,
              id: 'teacher',
              header: t('Teacher'),
              sortingFn: 'customSorting',
              Cell: ({ row }) => (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    component={Link}
                    href={`/users/view/${row.original.teacher.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: 600, textDecoration: 'none' }}
                  >
                    {renderUserFullname(
                      row.original.teacher.last_name,
                      row.original.teacher.first_name,
                      row.original.teacher.middle_name
                    )}
                  </Typography>
                </Box>
              )
            },
            {
              accessorKey: 'lesson_hours',
              accessorFn: row => row.subject_percents.length,
              id: 'lesson_hours',
              header: t('LessonHours'),
              Cell: ({ row }) => (
                <Typography sx={{ color: 'text.secondary' }}>{row.original.subject_percents.length}</Typography>
              )
            },
            {
              accessorKey: 'full',
              accessorFn: row =>
                row.subject_percents.filter((x: any) => {
                  return x.is_grade_full
                }).length,
              id: 'full',
              header: t('Full'),
              Cell: ({ row }) => (
                <>
                  {row.original.subject_percents.length > 0 ? (
                    <Typography color={'success.main'} fontWeight={600}>
                      {
                        row.original.subject_percents.filter((x: any) => {
                          return x.is_grade_full
                        }).length
                      }
                    </Typography>
                  ) : (
                    '-'
                  )}
                </>
              )
            },
            {
              accessorKey: 'not_full',
              accessorFn: row =>
                row.subject_percents.filter((x: any) => {
                  return !x.is_grade_full
                }).length,
              id: 'not_full',
              header: t('NotFull'),
              Cell: ({ row }) => (
                <>
                  {row.original.subject_percents.length > 0 ? (
                    <Typography color={'error.main'} fontWeight={600}>
                      {
                        row.original.subject_percents.filter((x: any) => {
                          return !x.is_grade_full
                        }).length
                      }
                    </Typography>
                  ) : (
                    '-'
                  )}
                </>
              )
            },
            {
              accessorKey: 'percent',
              accessorFn: row =>
                calculatePercentage(
                  row.subject_percents.length,
                  row.subject_percents.filter((x: any) => {
                    return x.is_grade_full
                  }).length
                ),
              id: 'percent',
              header: t('FullnessPercent'),
              Cell: ({ row }) => (
                <Box display={'flex'} justifyContent={'start'} alignItems={'center'}>
                  {row.original.subject_percents.length > 0 ? (
                    <>
                      <LinearProgress
                        color='primary'
                        value={calculatePercentage(
                          row.original.subject_percents.length,
                          row.original.subject_percents.filter((x: any) => {
                            return x.is_grade_full
                          }).length
                        )}
                        variant='determinate'
                        sx={{
                          height: 8,
                          width: 160,
                          borderRadius: 8
                        }}
                      />
                      <Typography ml={3}>{`${calculatePercentage(
                        row.original.subject_percents.length,
                        row.original.subject_percents.filter((x: any) => {
                          return x.is_grade_full
                        }).length
                      )}%`}</Typography>
                    </>
                  ) : (
                    '-'
                  )}
                </Box>
              )
            }
          ]
        : [],
    [current_role, t]
  )

  const detailTable = useMaterialReactTable({
    ...dataTableConfig,
    enableSorting: true,
    enableGrouping: true,
    enableRowActions: true,
    enableRowNumbers: true,
    enableStickyHeader: true,
    enableHiding: false,
    enablePagination: false,
    enableStickyFooter: false,
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
    muiTableContainerProps: { sx: { maxHeight: 'none' } },
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box display='flex' alignItems='center' justifyContent='center'>
        <IconButton
          size='small'
          onClick={() => {
            setShowTeacherDetail(true)
            handleSelectTeacher(
              dashboardDataDetail.report_by_teacher.find((data: any) => {
                return data.teacher.id === row.original.teacher.id
              })
            )
          }}
          sx={{ color: 'text.secondary' }}
        >
          <Icon icon='tabler:eye' fontSize={20} />
        </IconButton>
      </Box>
    ),
    columns: detailColumns,
    data: dashboardDataDetail?.report_by_teacher ? dashboardDataDetail?.report_by_teacher : [],
    initialState: {
      density: 'compact'
    },
    state: { isLoading: dashboard_data_detail.loading }
  })

  return (
    <Dialog
      fullWidth
      maxWidth={'xl'}
      open={show}
      onClose={handleClose}
      sx={{ '& .MuiPaper-root': { width: '100%' }, '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogContent
        sx={{
          pb: theme => `${theme.spacing(6)} !important`,
          pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        <Box
          sx={{
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Box width='100%' display='flex' alignItems='center' justifyContent='space-between' mb={4}>
            <Box></Box>
            <Typography variant='h4'>
              {school?.full_name} ({startDate && format(new Date(startDate), 'dd.MM.yyyy')}-
              {endDate && format(new Date(endDate), 'dd.MM.yyyy')})
            </Typography>
            <Button
              color='success'
              variant='contained'
              sx={{ px: 8 }}
              onClick={() => {
                convertDataByTeacherToExcel()
              }}
              startIcon={<Icon icon='tabler:download' fontSize={20} />}
            >
              <Translations text='Export' />
            </Button>
          </Box>
          <MaterialReactTable table={detailTable} />
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default DashboardAdminDetail
