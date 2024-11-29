import { SyntheticEvent, useEffect, useMemo, useState } from 'react'
import { Box, Button, CardContent, CircularProgress, Grid, ListItemText, MenuItem, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { SubjectListType } from 'src/entities/classroom/SubjectType'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchLessonsFinal, fetchLessonsQuarter } from 'src/features/store/apps/journal'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import CustomTextField from 'src/shared/components/mui/text-field'
import {
  generateFinalExamsTable,
  generateFinalTable,
  generateQuarterTable
} from 'src/features/utils/generateJournalTable'
import Translations from 'src/app/layouts/components/Translations'
import Error from 'src/widgets/general/Error'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import Icon from 'src/shared/components/icon'
import * as XLSX from 'xlsx'
import format from 'date-fns/format'

interface DataProps {
  type: string
  handleTypeChange: (val: any) => void
  school: LiteModelType | null
  handleSchoolChange: (val: any) => void
  classroom: LiteModelType | null
  handleClassroomChange: (val: any) => void
  subject: SubjectListType | null
  handleSubjectChange: (val: any) => void
  period: string | null
  handlePeriodChange: (val: string | null) => void
}

const QuarterExport = (props: DataProps) => {
  const type = props.type
  const handleTypeChange = props.handleTypeChange
  const school = props.school
  const handleSchoolChange = props.handleSchoolChange
  const classroom = props.classroom
  const handleClassroomChange = props.handleClassroomChange
  const subject = props.subject
  const handleSubjectChange = props.handleSubjectChange
  const period = props.period
  const handlePeriodChange = props.handlePeriodChange

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [subjectHeaders, setSubjectHeaders] = useState<any>({})
  const [subjectData, setSubjectData] = useState<any>([])
  const [allSubjectHeaders, setAllSubjectHeaders] = useState<any>({})
  const [allSubjectData, setAllSubjectData] = useState<any>([])

  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)
  const { subjects_list } = useSelector((state: RootState) => state.subjects)
  const { lessons_quarter } = useSelector((state: RootState) => state.journal)
  const { lessons_final } = useSelector((state: RootState) => state.journal)

  useEffect(() => {
    if (type === 'subject' && school && school.key && classroom && classroom.key && subject && subject.id) {
      setIsLoading(true)
      dispatch(fetchLessonsQuarter(subject.id))
    }
  }, [type, school, classroom, dispatch, subject])

  useEffect(() => {
    if (type === 'all_subject' && school && school.key && classroom && classroom.key && period) {
      setIsLoading(true)
      dispatch(fetchLessonsFinal({ classroom_id: classroom.key, period_number: period }))
    }
  }, [type, school, classroom, period, dispatch])

  useEffect(() => {
    if (
      type === 'subject' &&
      !lessons_quarter.loading &&
      lessons_quarter.status === 'success' &&
      school &&
      classroom &&
      subject
    ) {
      const [subjectHeaders, subjectRows] = generateQuarterTable(lessons_quarter.data, classroom, subject)
      setSubjectHeaders(subjectHeaders)
      setSubjectData(subjectRows)
      setIsLoading(false)
    }
  }, [type, school, classroom, lessons_quarter, subject, t])

  useEffect(() => {
    if (type === 'all_subject' && !lessons_final.loading && lessons_final.status === 'success' && classroom) {
      const [allSubjectHeaders, allSubjectRows] =
        period === '-1'
          ? generateFinalExamsTable(lessons_final.data, classroom)
          : generateFinalTable(lessons_final.data, classroom)
      setAllSubjectHeaders(allSubjectHeaders)
      setAllSubjectData(allSubjectRows)
      setIsLoading(false)
    }
  }, [type, classroom, lessons_final, period, t])

  const handleExport = () => {
    if (type === 'subject') {
      if (!subjectHeaders || !subjectData) return

      const transformedData = subjectData.map((row: any, index: number) => {
        const obj: any = {}
        obj['T/b'] = index + 1
        Object.keys(subjectHeaders).forEach(key => {
          obj[subjectHeaders[key]] = row[key] || ''
        })

        return obj
      })

      const worksheet = XLSX.utils.json_to_sheet(transformedData)
      const workbook = XLSX.utils.book_new()
      const wscols = [{ wch: 2 }, { wch: 40 }]
      worksheet['!cols'] = wscols
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ders boýunça çärýek bahalar')
      const exportDate = format(new Date(), 'dd.MM.yyyy')
      XLSX.writeFile(workbook, `Ders boýunça çärýek bahalar ${exportDate}.xlsx`)
    } else if (type === 'all_subject') {
      if (!allSubjectHeaders || !allSubjectData) return

      const transformedData = allSubjectData.map((row: any, index: number) => {
        const obj: any = {}
        obj['T/b'] = index + 1
        Object.keys(allSubjectHeaders).forEach(key => {
          obj[allSubjectHeaders[key]] = row[key] || ''
        })

        return obj
      })

      const worksheet = XLSX.utils.json_to_sheet(transformedData)
      const workbook = XLSX.utils.book_new()
      const wscols = [{ wch: 2 }, { wch: 40 }]
      worksheet['!cols'] = wscols
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ähli derslerden çärýek bahalar')
      const exportDate = format(new Date(), 'dd.MM.yyyy')
      XLSX.writeFile(workbook, `Ähli derslerden çärýek bahalar ${exportDate}.xlsx`)
    }
  }

  const subjectColumns = useMemo<MRT_ColumnDef<any>[]>(
    () =>
      subjectData.length
        ? Object.keys(subjectData[0]).map(columnId => {
            const col: any = {
              id: columnId,
              accessorKey: columnId,
              header: subjectHeaders[columnId as any] ?? '',
              ...(columnId.includes('period') ? { size: 100 } : null),
              ...(columnId !== 'student' && {
                muiTableHeadCellProps: {
                  align: 'center'
                },
                muiTableBodyCellProps: {
                  align: 'center'
                }
              }),
              Header: ({ column }: { column: any }) => (
                <Typography sx={{ whiteSpace: 'normal', textWrap: 'wrap' }}>{column.columnDef.header}</Typography>
              ),
              Cell: ({ cell }: { cell: any }) => {
                return <Typography>{cell.getValue()}</Typography>
              }
            }

            return col
          })
        : [],
    [subjectData, subjectHeaders]
  )

  const allSubjectColumns = useMemo<MRT_ColumnDef<any>[]>(
    () =>
      allSubjectData.length
        ? Object.keys(allSubjectData[0]).map(columnId => {
            const col: any = {
              id: columnId,
              accessorKey: columnId,
              header: allSubjectHeaders[columnId as any] ?? '',
              ...(columnId !== 'key1' ? { size: 'auto' } : null),
              ...(columnId !== 'key1' && {
                muiTableHeadCellProps: {
                  align: 'center'
                },
                muiTableBodyCellProps: {
                  align: 'center'
                }
              }),
              Header: ({ column }: { column: any }) => (
                <Typography sx={{ whiteSpace: 'normal', textWrap: 'wrap' }}>{column.columnDef.header}</Typography>
              ),
              Cell: ({ cell }: { cell: any }) => {
                return <Typography>{cell.getValue()}</Typography>
              }
            }

            return col
          })
        : [],
    [allSubjectData, allSubjectHeaders]
  )

  const subjectTable = useMaterialReactTable({
    ...dataTableConfig,
    enableSorting: true,
    enableRowNumbers: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableColumnPinning: true,
    enableHiding: false,
    enableGrouping: false,
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
    muiTablePaperProps: { sx: { boxShadow: 'none!important' } },
    muiBottomToolbarProps: { sx: { paddingLeft: 4 } },
    muiTableHeadCellProps: {
      sx: {
        borderRight: theme => `1px solid ${theme.palette.divider}`
      }
    },
    muiTableBodyCellProps: {
      padding: 'none',
      sx: {
        minHeight: 36,
        height: 36,
        borderRight: theme => `1px solid ${theme.palette.divider}`
      }
    },
    muiTableContainerProps: { sx: { maxHeight: '80vh' } },
    columns: subjectColumns,
    data: subjectData,
    getRowId: row => row?.key1,
    muiToolbarAlertBannerProps: lessons_quarter.error
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    state: {
      density: 'compact',
      isLoading: isLoading || lessons_quarter.loading,
      columnPinning: { left: ['mrt-row-numbers', 'student'] }
    }
  })

  const allSubjectTable = useMaterialReactTable({
    ...dataTableConfig,
    enableSorting: true,
    enableRowNumbers: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableColumnPinning: true,
    enableHiding: false,
    enableGrouping: false,
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
    muiTablePaperProps: { sx: { boxShadow: 'none!important' } },
    muiBottomToolbarProps: { sx: { paddingLeft: 4 } },
    muiTableHeadCellProps: {
      sx: {
        borderRight: theme => `1px solid ${theme.palette.divider}`
      }
    },
    muiTableBodyCellProps: {
      padding: 'none',
      sx: {
        minHeight: 36,
        height: 36,
        borderRight: theme => `1px solid ${theme.palette.divider}`
      }
    },
    muiTableContainerProps: { sx: { maxHeight: '80vh' } },
    columns: allSubjectColumns,
    data: allSubjectData,
    getRowId: row => row?.key1,
    muiToolbarAlertBannerProps: lessons_final.error
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    state: {
      density: 'compact',
      isLoading: isLoading || lessons_final.loading,
      columnPinning: { left: ['mrt-row-numbers', 'key1'] }
    }
  })

  if (lessons_quarter.error) {
    return <Error error={lessons_quarter.error} />
  }

  if (lessons_final.error) {
    return <Error error={lessons_final.error} />
  }

  return (
    <>
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={2.4}>
            <CustomTextField
              select
              fullWidth
              defaultValue={type}
              label={t('Type')}
              id='type-filter'
              SelectProps={{ value: type, onChange: e => handleTypeChange(e.target.value as string) }}
            >
              <MenuItem value='subject'>
                <Translations text='QuarterExport' />
              </MenuItem>
              <MenuItem value='all_subject'>
                <Translations text='FinalsExport' />
              </MenuItem>
            </CustomTextField>
          </Grid>
          {type && (
            <Grid item xs={12} sm={2.4}>
              <CustomAutocomplete
                id='school_id'
                value={school}
                options={schools_lite_list.data}
                loading={schools_lite_list.loading}
                loadingText={t('ApiLoading')}
                onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                  handleSchoolChange(newValue)
                }}
                noOptionsText={t('NoRows')}
                renderOption={(props, item) => (
                  <li {...props} key={item.key}>
                    <ListItemText>{item.value}</ListItemText>
                  </li>
                )}
                getOptionLabel={option => option.value || ''}
                renderInput={params => <CustomTextField {...params} label={t('School')} />}
              />
            </Grid>
          )}
          {school && (
            <Grid item xs={12} sm={2.4}>
              <CustomAutocomplete
                id='classroom_id'
                value={classroom}
                options={classrooms_lite_list.data}
                loading={classrooms_lite_list.loading}
                loadingText={t('ApiLoading')}
                onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                  handleClassroomChange(newValue)
                }}
                noOptionsText={t('NoRows')}
                renderOption={(props, item) => (
                  <li {...props} key={item.key}>
                    <ListItemText>{item.value}</ListItemText>
                  </li>
                )}
                getOptionLabel={option => option.value || ''}
                renderInput={params => <CustomTextField {...params} label={t('Classroom')} />}
              />
            </Grid>
          )}
          {type === 'subject' && school && classroom && (
            <Grid item xs={12} sm={2.4}>
              <CustomAutocomplete
                id='subject_id'
                value={subject}
                options={subjects_list.data}
                loading={subjects_list.loading}
                loadingText={t('ApiLoading')}
                onChange={(event: SyntheticEvent, newValue: SubjectListType | null) => {
                  handleSubjectChange(newValue)
                }}
                noOptionsText={t('NoRows')}
                renderOption={(props, item) => (
                  <li {...props} key={item.id}>
                    <ListItemText>
                      {item.name} -{' '}
                      {renderUserFullname(item.teacher?.last_name, item.teacher?.first_name, item.teacher?.middle_name)}
                    </ListItemText>
                  </li>
                )}
                getOptionLabel={option =>
                  option.name +
                    ` - ${renderUserFullname(
                      option.teacher?.last_name,
                      option.teacher?.first_name,
                      option.teacher?.middle_name
                    )}` || ''
                }
                renderInput={params => <CustomTextField {...params} label={t('Subject')} />}
              />
            </Grid>
          )}
          {type === 'all_subject' && school && classroom && (
            <Grid item xs={12} sm={2.4}>
              <CustomTextField
                select
                fullWidth
                defaultValue={period}
                label={t('Quarter')}
                id='period-filter'
                SelectProps={{ value: period, onChange: e => handlePeriodChange(e.target.value as string) }}
              >
                <MenuItem value='1'>
                  I <Translations text='Quarter' />
                </MenuItem>
                <MenuItem value='2'>
                  II <Translations text='Quarter' />
                </MenuItem>
                <MenuItem value='3'>
                  III <Translations text='Quarter' />
                </MenuItem>
                <MenuItem value='4'>
                  IV <Translations text='Quarter' />
                </MenuItem>
                <MenuItem value='-1'>
                  <Translations text='Exam' />
                </MenuItem>
              </CustomTextField>
            </Grid>
          )}
          {((type === 'subject' && school && classroom && subject) ||
            (type === 'all_subject' && school && classroom && period)) && (
            <Grid item xs={12} sm={2.4} container direction='column' justifyContent='flex-end'>
              <Button
                fullWidth
                color='success'
                variant='contained'
                onClick={() => {
                  !isLoading && handleExport()
                }}
                sx={{ px: 6 }}
                startIcon={<Icon icon='tabler:download' fontSize={20} />}
              >
                <Translations text='Export' />
              </Button>
            </Grid>
          )}
        </Grid>
      </CardContent>

      {type === 'subject' && school && classroom && subject ? (
        !isLoading ? (
          <MaterialReactTable table={subjectTable} />
        ) : (
          <Box width='100%' height='50vh' display='flex' alignItems='center' justifyContent='center'>
            <CircularProgress />
          </Box>
        )
      ) : null}

      {type === 'all_subject' && school && classroom && period ? (
        !isLoading ? (
          <MaterialReactTable table={allSubjectTable} />
        ) : (
          <Box width='100%' height='50vh' display='flex' alignItems='center' justifyContent='center'>
            <CircularProgress />
          </Box>
        )
      ) : null}
    </>
  )
}

export default QuarterExport
