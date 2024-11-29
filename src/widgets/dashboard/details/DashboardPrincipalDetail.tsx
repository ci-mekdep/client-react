import { useMemo } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  IconButtonProps,
  Tooltip,
  Typography,
  styled
} from '@mui/material'
import format from 'date-fns/format'
import { useTranslation } from 'react-i18next'
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import Icon from 'src/shared/components/icon'
import Translations from 'src/app/layouts/components/Translations'
import { useAuth } from 'src/features/hooks/useAuth'

import { exportToExcel } from 'src/features/utils/exportToExcel'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import CustomAvatar from 'src/shared/components/mui/avatar'

import { DateType } from 'src/entities/app/GeneralTypes'
import { UserListType } from 'src/entities/school/UserType'
import { PrincipalSubjectPercentType } from 'src/entities/app/DashboardType'
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
  startDate?: DateType | null
  endDate?: DateType | null
  teacher: UserListType
  subject_percents: PrincipalSubjectPercentType[]
  handleClose: () => void
}

const DashboardPrincipalDetail = (props: PropsType) => {
  const show = props.show
  const startDate = props.startDate
  const endDate = props.endDate
  const teacher = props.teacher
  const subject_percents = props.subject_percents
  const handleClose = props.handleClose

  const { t } = useTranslation()
  const { current_role } = useAuth()

  const convertDataBySubjectToExcel = () => {
    const transformedData = subject_percents.map((row: any) => {
      const obj: any = {}
      obj['Ders'] = row.classroom_name + ' - ' + row.subject_name
      obj['Sene'] = row.lesson_date ? format(new Date(row.lesson_date), 'dd.MM.yyyy') : ''
      obj['Temanyň ady'] = row.lesson_title
      obj['Öý işi'] = row.assignment_title !== null && row.assignment_title !== '' ? 'Bar' : 'Ýok'
      obj['Dolylyk'] = row.grade_full_percent
      obj['Gatnaşyk'] = row.absent_percent
      obj['Okuwçy sany'] = row.students_count

      return obj
    })

    const date =
      startDate && format(new Date(startDate), 'dd.MM.yyyy') + endDate
        ? ` - ${endDate && format(new Date(endDate), 'dd.MM.yyyy')}`
        : ''

    exportToExcel(`Žurnallaryň dolulygynyň hasabaty ${date}.xlsx`, transformedData)
  }

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () =>
      current_role === 'admin' || current_role === 'organization' || current_role === 'principal'
        ? [
            {
              accessorKey: 'subject',
              accessorFn: row => row.subject_name,
              id: 'subject',
              header: t('SubjectName'),
              sortingFn: 'customSorting',
              Cell: ({ row }) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {row.original.classroom_name + ' - ' + row.original.subject_name}
                  </Typography>
                  <Typography variant='body2' textAlign='start'>
                    {row.original.lesson_date && format(new Date(row.original.lesson_date), 'dd.MM.yyyy')}
                  </Typography>
                </Box>
              )
            },
            {
              accessorKey: 'lesson_title',
              accessorFn: row => row.lesson_title,
              id: 'lesson_title',
              header: t('LessonTitle'),
              Cell: ({ row }) => (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  {row.original.assignment_title !== null && row.original.assignment_title !== '' ? (
                    <CustomAvatar
                      skin='light'
                      color='success'
                      variant='circular'
                      sx={{ height: '25px', width: '25px' }}
                    >
                      <Icon icon='tabler:home-edit' fontSize={16} />
                    </CustomAvatar>
                  ) : (
                    <CustomAvatar skin='light' color='error' variant='circular' sx={{ height: '25px', width: '25px' }}>
                      <Icon icon='tabler:home-edit' fontSize={16} />
                    </CustomAvatar>
                  )}
                  <Typography sx={{ color: 'text.secondary', wordWrap: 'inherit' }}>
                    {row.original.lesson_title}
                  </Typography>
                </Box>
              )
            },
            {
              accessorKey: 'grade_full_percent',
              accessorFn: row => row.grade_full_percent,
              id: 'grade_full_percent',
              header: t('FullnessPercent'),
              Cell: ({ row }) => (
                <Typography sx={{ color: row.original.is_grade_full ? 'success.main' : 'error.main' }}>
                  {row.original.grade_full_percent}
                </Typography>
              )
            },
            {
              accessorKey: 'absent_percent',
              accessorFn: row => row.absent_percent,
              id: 'absent_percent',
              header: t('AbsentPercent'),
              Cell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.original.absent_percent}</Typography>
            },
            {
              accessorKey: 'students_count',
              accessorFn: row => row.students_count,
              id: 'students_count',
              header: t('StudentsCount'),
              Cell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.original.students_count}</Typography>
            }
          ]
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
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
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around'
        }}
      >
        <Tooltip title={t('ViewJournal')}>
          <IconButton
            size='small'
            target='_blank'
            href={`/tools/export?type=journal_export&classroom_id=${row.original.classroom_id}&subject_id=${row.original.subject_id}`}
            sx={{ color: 'text.secondary' }}
          >
            <Icon icon='tabler:book' />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    columns,
    data: subject_percents ? subject_percents : [],
    initialState: {
      density: 'compact'
    }
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
        <CustomCloseButton onClick={() => handleClose()}>
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
              {renderUserFullname(teacher.last_name, teacher.first_name, teacher.middle_name)} (
              {startDate && format(new Date(startDate), 'dd.MM.yyyy')}-
              {endDate && format(new Date(endDate), 'dd.MM.yyyy')})
            </Typography>
            <Button
              color='success'
              variant='contained'
              sx={{ px: 8 }}
              onClick={() => {
                convertDataBySubjectToExcel()
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

export default DashboardPrincipalDetail
