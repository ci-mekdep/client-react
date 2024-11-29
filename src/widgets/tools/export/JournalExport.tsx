import { SyntheticEvent, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  CircularProgress,
  Grid,
  ListItemText,
  MenuItem,
  Tooltip,
  Typography
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import Translations from 'src/app/layouts/components/Translations'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { SubjectListType } from 'src/entities/classroom/SubjectType'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchLessonsJournal } from 'src/features/store/apps/journal'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import CustomTextField from 'src/shared/components/mui/text-field'
import { generateJournalGradesTable } from 'src/features/utils/generateJournalTable'
import Error from 'src/widgets/general/Error'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { renderLessonType } from 'src/features/utils/ui/renderLessonType'
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'
import dataTableConfig from 'src/app/configs/dataTableConfig'
import { JournalLessonsType } from 'src/entities/journal/JournalType'
import { LessonType } from 'src/entities/journal/LessonType'
import CustomChip from 'src/shared/components/mui/chip'
import Icon from 'src/shared/components/icon'
import * as XLSX from 'xlsx'
import LessonDetailModal from './LessonDetailModal'
import format from 'date-fns/format'

interface DataProps {
  school: LiteModelType | null
  handleSchoolChange: (val: any) => void
  classroom: LiteModelType | null
  handleClassroomChange: (val: any) => void
  subject: SubjectListType | null
  handleSubjectChange: (val: any) => void
  period: string | null
  handlePeriodChange: (val: string | null) => void
}

const JournalExport = (props: DataProps) => {
  const school = props.school
  const handleSchoolChange = props.handleSchoolChange
  const classroom = props.classroom
  const handleClassroomChange = props.handleClassroomChange
  const subject = props.subject
  const handleSubjectChange = props.handleSubjectChange
  const period = props.period
  const handlePeriodChange = props.handlePeriodChange

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [gradesHeaders, setGradesHeaders] = useState<any>({})
  const [gradesData, setGradesData] = useState<any>([])
  const [tooltips, setTooltips] = useState<any>({})
  const [themesData, setThemesData] = useState<LessonType[]>([])
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [detailData, setDetailData] = useState<LessonType | null>(null)
  const [dataType, setDataType] = useState<'grades' | 'themes'>('grades')

  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { subjects_list } = useSelector((state: RootState) => state.subjects)
  const { lessons_journal } = useSelector((state: RootState) => state.journal)

  useEffect(() => {
    if (school && school.key && classroom && classroom.key && subject && subject.id && period) {
      setIsLoading(false)
      dispatch(
        fetchLessonsJournal({
          is_list: true,
          subject_id: subject.id,
          period_number: parseInt(period)
        })
      )
    }
  }, [school, classroom, dispatch, period, subject])

  useEffect(() => {
    if (!lessons_journal.loading && lessons_journal.status === 'success' && school && classroom && subject && period) {
      const [gradesHeaders, gradesRows, tooltips] = generateJournalGradesTable(
        lessons_journal.data,
        period,
        classroom,
        subject
      )
      setThemesData(lessons_journal.data?.lessons.map((item: JournalLessonsType) => item.lesson))
      setGradesHeaders(gradesHeaders)
      setGradesData(gradesRows)
      setTooltips(tooltips)
      setIsLoading(false)
    }
  }, [school, classroom, lessons_journal, period, subject, t])

  const handleClose = () => {
    setIsOpen(false)
    setDetailData(null)
  }

  const handleExport = () => {
    if (dataType === 'grades') {
      if (!gradesHeaders || !gradesData) return

      const transformedData = gradesData.map((row: any, index: number) => {
        const obj: any = {}
        obj['T/b'] = index + 1
        Object.keys(gradesHeaders).forEach(key => {
          obj[gradesHeaders[key]] = row[key] || ''
        })

        return obj
      })

      const worksheet = XLSX.utils.json_to_sheet(transformedData)
      const workbook = XLSX.utils.book_new()
      const wscols = [{ wch: 2 }, { wch: 40 }]
      worksheet['!cols'] = wscols
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Žurnal eksport (bahalar)')
      const exportDate = format(new Date(), 'dd.MM.yyyy')
      XLSX.writeFile(workbook, `Žurnal eksport (bahalar) ${exportDate}.xlsx`)
    } else if (dataType === 'themes') {
      if (!themesData) return

      const transformedData = themesData?.map((row: LessonType, index: number) => {
        const obj: any = {}
        obj['T/b'] = index + 1
        obj['Synp'] = row.subject?.classroom?.name || ''
        obj['Ders'] = row.subject?.name || ''
        obj['Sene'] = row.date
        obj['Tema'] = row.title
        obj['Görnüşi'] = renderLessonType(row.type_title)
        obj['Öý işi'] = row.assignment?.title || ''
        obj['Ýörite tema'] = row.lesson_pro?.title || ''

        return obj
      })

      const worksheet = XLSX.utils.json_to_sheet(transformedData)
      const workbook = XLSX.utils.book_new()
      const wscols = [
        { wch: 2 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 50 },
        { wch: 30 },
        { wch: 30 },
        { wch: 20 }
      ]
      worksheet['!cols'] = wscols
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Žurnal eksport (temalar)')
      const exportDate = format(new Date(), 'dd.MM.yyyy')
      XLSX.writeFile(workbook, `Žurnal eksport (temalar) ${exportDate}.xlsx`)
    }
  }

  const gradesColumns = useMemo<MRT_ColumnDef<any>[]>(
    () =>
      gradesData.length
        ? Object.keys(gradesData[0]).map(columnId => {
            const col: any = {
              id: columnId,
              accessorKey: columnId,
              header: gradesHeaders[columnId as any] ?? '',
              ...(columnId === 'quarter' ? { size: 150 } : columnId !== 'key1' ? { size: 'auto' } : null),
              ...(columnId !== 'key1' && {
                muiTableHeadCellProps: {
                  align: 'center'
                },
                muiTableBodyCellProps: {
                  align: 'center'
                }
              }),
              Header: ({ column }: { column: any }) => (
                <>
                  {columnId.includes('key') && columnId !== 'key1' ? (
                    <Tooltip
                      arrow
                      placement='top'
                      title={tooltips[columnId]}
                      componentsProps={{
                        tooltip: {
                          sx: {
                            whiteSpace: 'pre-wrap'
                          }
                        }
                      }}
                    >
                      <Box
                        sx={{
                          '& svg': { color: tooltips[columnId] ? 'primary.main' : 'secondary.main' }
                        }}
                      >
                        <Typography sx={{ whiteSpace: 'normal', textWrap: 'wrap' }}>
                          {column.columnDef.header}
                        </Typography>
                        <Icon
                          icon={tooltips[columnId] ? 'tabler:bookmark-filled' : 'tabler:bookmark'}
                          color='primary'
                          fontSize='1.25rem'
                        />
                      </Box>
                    </Tooltip>
                  ) : (
                    <Typography sx={{ whiteSpace: 'normal', textWrap: 'wrap' }}>{column.columnDef.header}</Typography>
                  )}
                </>
              ),
              Cell: ({ cell }: { cell: any }) => {
                return <Typography>{cell.getValue()}</Typography>
              }
            }

            return col
          })
        : [],
    [gradesData, gradesHeaders, tooltips]
  )

  const themesColumns = useMemo<MRT_ColumnDef<LessonType>[]>(
    () => [
      {
        accessorKey: 'date',
        accessorFn: row => row.date,
        id: 'date',
        header: t('Date'),
        Cell: ({ row }) => <Typography>{row.original.date}</Typography>
      },
      {
        accessorKey: 'title',
        accessorFn: row => row.title,
        id: 'title',
        header: t('Name') + '/' + t('Type'),
        Cell: ({ row }) => (
          <Box>
            <Typography fontWeight={600}>{row.original.title}</Typography>
            <Typography>{renderLessonType(row.original.type_title)}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'assignment',
        accessorFn: row => row.assignment && row.assignment.title,
        id: 'assignment',
        header: t('Homework'),
        Cell: ({ row }) => (
          <Box>
            <Typography fontWeight={600}>{row.original.assignment?.title}</Typography>
            {row.original.assignment?.files && (
              <CustomChip
                rounded
                size='small'
                skin='light'
                color='primary'
                label={`${row.original.assignment?.files?.length} ${t('Files')}`}
              />
            )}
          </Box>
        )
      }
    ],
    [t]
  )

  const gradesTable = useMaterialReactTable({
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
    columns: gradesColumns,
    data: gradesData,
    getRowId: row => row?.key1,
    muiToolbarAlertBannerProps: lessons_journal.error
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    state: {
      density: 'compact',
      isLoading: isLoading || lessons_journal.loading,
      columnPinning: { left: ['mrt-row-numbers', 'key1'], right: ['quarter'] }
    }
  })

  const themesTable = useMaterialReactTable({
    ...dataTableConfig,
    enableSorting: true,
    enableRowNumbers: true,
    enableRowActions: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableColumnPinning: true,
    enableHiding: false,
    enableGrouping: false,
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
    muiTablePaperProps: { sx: { boxShadow: 'none!important' } },
    muiBottomToolbarProps: { sx: { paddingLeft: 4 } },
    muiTableBodyCellProps: {
      padding: 'none',
      sx: {
        minHeight: 62,
        height: 62
      }
    },
    muiTableContainerProps: { sx: { maxHeight: '80vh' } },
    columns: themesColumns,
    data: themesData,
    getRowId: row => row.id,
    renderRowActions: ({ row }) => (
      <Button
        variant='tonal'
        size='small'
        onClick={() => {
          setDetailData(row.original)
          setIsOpen(true)
        }}
        startIcon={<Icon icon='tabler:eye' fontSize={20} />}
      >
        <Translations text='View' />
      </Button>
    ),
    muiToolbarAlertBannerProps: lessons_journal.error
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,
    state: {
      density: 'compact',
      isLoading: isLoading || lessons_journal.loading
    }
  })

  if (lessons_journal.error) {
    return <Error error={lessons_journal.error} />
  }

  return (
    <>
      {detailData && <LessonDetailModal isOpen={isOpen} detailData={detailData} handleClose={handleClose} />}
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={2}>
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
          {school && (
            <Grid item xs={12} sm={2}>
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
          {school && classroom && (
            <Grid item xs={12} sm={2}>
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
          {classroom && subject && (
            <Grid item xs={12} sm={2}>
              <CustomTextField
                select
                fullWidth
                defaultValue={period}
                label={t('Quarter')}
                id='quarter-filter'
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
              </CustomTextField>
            </Grid>
          )}
          {classroom && subject && (
            <Grid item xs={12} sm={2} container direction='column' justifyContent='flex-end'>
              <ButtonGroup fullWidth>
                <Button
                  variant={dataType === 'grades' ? 'contained' : 'outlined'}
                  onClick={() => setDataType('grades')}
                >
                  <Translations text='Grades' />
                </Button>
                <Button
                  variant={dataType === 'themes' ? 'contained' : 'outlined'}
                  onClick={() => setDataType('themes')}
                >
                  <Translations text='Themes' />
                </Button>
              </ButtonGroup>
            </Grid>
          )}
          {classroom && subject && (
            <Grid item xs={12} sm={2} container direction='column' justifyContent='flex-end'>
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
      {classroom && subject ? (
        !isLoading ? (
          dataType === 'grades' ? (
            <MaterialReactTable table={gradesTable} />
          ) : (
            <MaterialReactTable table={themesTable} />
          )
        ) : (
          <Box width={'100%'} height={'50vh'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <CircularProgress />
          </Box>
        )
      ) : null}
    </>
  )
}

export default JournalExport
