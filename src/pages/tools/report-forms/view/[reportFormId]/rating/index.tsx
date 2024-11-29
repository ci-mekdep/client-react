// ** React Imports
import { useEffect, useMemo, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'

// ** Custom Components Import

// ** Types

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { useTranslation } from 'react-i18next'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import { getReportFormRating } from 'src/features/store/apps/tools/reportForms'
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import { ReportFormRatingRowType } from 'src/entities/app/ReportFormType'
import Translations from 'src/app/layouts/components/Translations'

const ReportFormChartView = () => {
  const [data, setData] = useState<ReportFormRatingRowType[]>([])

  const router = useRouter()
  const id = router.query.reportFormId
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { report_form_rating } = useSelector((state: RootState) => state.reportForms)

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getReportFormRating(id as string))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (!report_form_rating.loading && report_form_rating.status === 'success' && report_form_rating.data) {
      setData(report_form_rating.data.rating)
    }
  }, [report_form_rating.data, report_form_rating.loading, report_form_rating.status])

  const columns = useMemo<MRT_ColumnDef<ReportFormRatingRowType>[]>(
    () => [
      {
        accessorKey: 'index',
        accessorFn: row => row.index,
        id: 'index',
        header: t('RatingPlace'),
        Cell: ({ row }) => <Typography>{row.original.index}</Typography>
      },
      {
        accessorKey: 'school',
        accessorFn: row => row.report_item?.school?.name,
        id: 'school',
        header: t('EduCenter'),
        Cell: ({ row }) => <Typography>{row.original.report_item?.school?.name}</Typography>,
        sortingFn: 'customSorting'
      },
      {
        accessorKey: 'point',
        accessorFn: row => row.value,
        id: 'point',
        header: t('Point'),
        Cell: ({ row }) => <Typography>{row.original.value}</Typography>
      }
    ],
    [t]
  )

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableRowNumbers: true,
    enableStickyHeader: true,
    enableHiding: false,
    enablePagination: false,
    enableRowActions: false,
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
    data,
    getRowId: row => (row?.index ? row.index.toString() : ''),
    muiToolbarAlertBannerProps: report_form_rating.error
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    renderBottomToolbarCustomActions: () => (
      <Typography sx={{ color: 'text.secondary' }}>
        <Translations text='Total' /> {report_form_rating.total}.
      </Typography>
    ),
    rowCount: report_form_rating.total,
    state: {
      density: 'compact',
      isLoading: report_form_rating.loading
    }
  })

  if (report_form_rating.error) {
    return <Error error={report_form_rating.error} />
  }

  if (!report_form_rating.loading && id) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('CenterRating')} />
            <Divider />
            <MaterialReactTable table={table} />
          </Card>
        </Grid>
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

ReportFormChartView.acl = {
  action: 'read',
  subject: 'tool_report_forms'
}

export default ReportFormChartView
