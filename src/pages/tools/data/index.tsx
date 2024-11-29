import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Card,
  CardHeader,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography
} from '@mui/material'
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import toast from 'react-hot-toast'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchDataReports, updateDataReports } from 'src/features/store/apps/tools/data'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import Icon from 'src/shared/components/icon'
import format from 'date-fns/format'
import Error from 'src/widgets/general/Error'
import ToolsDataDialog from 'src/widgets/tools/data/ToolsDataDialog'
import { ReportDataFormType } from 'src/entities/journal/ReportType'
import Translations from 'src/app/layouts/components/Translations'

const ToolsData = () => {
  // ** State
  const [regions, setRegions] = useState<string[] | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [data, setData] = useState<any[]>([])
  const [headers, setHeaders] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [sumValues, setSumValues] = useState<any>(null)
  const [selectedData, setSelectedData] = useState<any | null>(null)

  // ** Hooks
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { data_reports, update_data_reports } = useSelector((state: RootState) => state.dataReports)

  useEffect(() => {
    dispatch(fetchDataReports())
  }, [dispatch])

  useEffect(() => {
    if (!data_reports.loading && data_reports.data && data_reports.status === 'success') {
      const values: any = {}
      data_reports.data.forEach((item: any) => {
        if (item.settings && Array.isArray(item.settings)) {
          item.settings.forEach((setting: any) => {
            if (typeof setting.value === 'string' && setting.value.length > 0 && setting.type === 'number') {
              const key = setting.key
              if (!values[key]) {
                values[key] = 0
              }
              values[key] += parseInt(setting.value)
            }
          })
        }
      })

      setSumValues(values)
    }
  }, [data_reports])

  useEffect(() => {
    if (
      sumValues &&
      !data_reports.loading &&
      data_reports.data &&
      data_reports.data.length > 0 &&
      data_reports.status === 'success'
    ) {
      let updatedData: any[] = []
      updatedData = data_reports.data.map((row: any) => {
        const obj: any = {}
        obj.id = row.school.id
        obj.school = row.school.name
        obj.region = row.school?.parent?.name
        obj.school_id = row.school.id
        obj.updated_at = row.updated_at ? row.updated_at : ''
        row.settings.map((s: any) => {
          obj[s.key] = s.value
        })

        return obj
      })

      const uniqueRegions = [...new Set(data_reports.data.map((item: any) => item.school?.parent?.name))]
      setRegions(uniqueRegions as string[])
      setFilteredData(updatedData)
      setData(updatedData)

      setHeaders([
        {
          id: 'school',
          header: 'Mekdep',
          accessorKey: 'school',
          Cell: ({ row }: { row: any }) => (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography>{row.original.school}</Typography>
              <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                {row.original.region}
              </Typography>
            </Box>
          ),
          Footer: () => 'Jemi:'
        },
        ...data_reports.data[0].settings.map((s: any) => {
          const header: any = {
            id: s.key,
            header: s.title,
            accessorKey: s.key,
            Footer: () => sumValues[s.key]
          }
          if (s.type === 'boolean') {
            header['Cell'] = ({ cell }: { cell: any }) =>
              cell.getValue() === '1' ? t('Yes') : cell.getValue() === '0' ? t('No') : ''
          }

          return header
        })
      ])
    }
  }, [data_reports, sumValues, t])

  const handleSaveData = (id: string, items: ReportDataFormType[]) => {
    const obj: any = {}
    obj.settings = [
      {
        school_id: id,
        items: items
      }
    ]
    const toastId = toast.loading(t('ApiLoading'))
    dispatch(updateDataReports(obj))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        dispatch(fetchDataReports())
        handleClose()
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  const handleClose = () => {
    setDialogOpen(false)
    setSelectedData(null)
  }

  const handleChangeRegion = (e: SelectChangeEvent<string>) => {
    e?.preventDefault()
    setSelectedRegion(e.target.value)

    if (e.target.value === 'all') {
      setFilteredData(data)
    } else {
      const filteredData = data.filter((item: any) => item.region === e.target.value)
      setFilteredData(filteredData)
    }
  }

  const columns = useMemo<MRT_ColumnDef<any>[]>(() => headers, [headers])

  const table = useMaterialReactTable({
    ...dataTableConfig,
    enableSorting: true,
    enableRowActions: true,
    enableRowNumbers: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableColumnPinning: true,
    enableHiding: false,
    enableEditing: false,
    enableGrouping: false,
    enablePagination: false,
    enableRowSelection: false,
    enableGlobalFilter: false,
    enableDensityToggle: false,
    renderBottomToolbar: false,
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
        boxShadow: 'none!important',
        borderTop: theme => `1px solid ${theme.palette.divider}`
      }
    },
    muiTableContainerProps: {
      sx: { maxHeight: '80vh' }
    },
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 120,
        grow: false
      }
    },
    positionActionsColumn: 'last',
    columns,
    data: useMemo(() => filteredData, [filteredData]),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', width: '100%', gap: '1rem' }}>
        <Tooltip
          placement='left'
          title={
            row.original.updated_at
              ? t('LastEditedTime') + ': ' + format(new Date(row.original.updated_at), 'dd.MM.yyyy HH:mm')
              : ''
          }
        >
          <IconButton
            onClick={() => {
              setDialogOpen(true)
              setSelectedData(data_reports.data.find((data: any) => data.school.id === row.original.school_id))
            }}
          >
            <Icon fontSize={22} icon='tabler:edit' />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    initialState: {
      columnVisibility: {
        region: false
      }
    },
    state: {
      columnPinning: { left: ['mrt-row-numbers', 'school'] },
      density: 'compact',
      isSaving: update_data_reports.loading
    }
  })

  if (data_reports.error) {
    return <Error error={data_reports.error} />
  }

  return (
    <>
      {selectedData && (
        <ToolsDataDialog
          data={selectedData}
          dialogOpen={dialogOpen}
          handleClose={handleClose}
          handleSaveData={handleSaveData}
        />
      )}
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('Data')}
              action={
                <FormControl size='small' sx={{ minWidth: 200 }}>
                  <InputLabel id='region-filter-label'>
                    <Translations text='Region' />
                  </InputLabel>
                  <Select
                    label={t('Region')}
                    value={selectedRegion}
                    onChange={handleChangeRegion}
                    id='region-filter'
                    labelId='region-filter-label'
                    sx={{ minWidth: 100 }}
                  >
                    <MenuItem value='all'>
                      <Translations text='All' />
                    </MenuItem>
                    {regions &&
                      regions.map((region: string, index: number) => (
                        <MenuItem key={index} value={region}>
                          {region}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              }
            />
            {headers.length === 0 && data_reports.loading ? (
              <Box
                sx={{
                  width: '100%',
                  height: '40vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <MaterialReactTable table={table} />
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

ToolsData.acl = {
  action: 'read',
  subject: 'tool_reports_data'
}

export default ToolsData
