import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControlLabel,
  Grid,
  IconButton,
  IconButtonProps,
  MenuItem,
  Typography,
  styled
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Translations from 'src/app/layouts/components/Translations'
import { ReportFormOptionScheme, ReportDataFormType } from 'src/entities/journal/ReportType'
import { RootState } from 'src/features/store'
import Icon from 'src/shared/components/icon'
import CustomTextField from 'src/shared/components/mui/text-field'

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

interface ToolsDataDialogProps {
  data: any
  dialogOpen: boolean
  handleClose: () => void
  handleSaveData: (id: string, items: ReportDataFormType[]) => void
}

type DataInputPropsType = {
  index: number
  option: ReportFormOptionScheme
  reportForm: ReportDataFormType[]
  handleUpdateReportForm: (val: any) => void
}

const DataInputs = (props: DataInputPropsType) => {
  const { index, option, reportForm, handleUpdateReportForm } = props

  const currentValue = reportForm.find((data: ReportDataFormType) => data.key === option.key)?.value || ''

  switch (option.type) {
    case 'number':
      return (
        <CustomTextField
          fullWidth
          name={option.key}
          type='number'
          label={option.title}
          value={currentValue}
          InputProps={{ inputProps: { tabIndex: index + 1 } }}
          onChange={handleUpdateReportForm}
        />
      )
    case 'boolean':
      return (
        <FormControlLabel
          name={option.key}
          label={option.title}
          control={<Checkbox tabIndex={index + 1} checked={currentValue === '1'} onChange={handleUpdateReportForm} />}
        />
      )
    case 'options':
      return (
        <CustomTextField
          select
          fullWidth
          name={option.key}
          label={option.title}
          id={option.key}
          value={currentValue}
          InputProps={{ inputProps: { tabIndex: index + 1 } }}
          onChange={handleUpdateReportForm}
        >
          {option.options?.map((o: string, index: number) => (
            <MenuItem key={index} value={o}>
              {o}
            </MenuItem>
          ))}
        </CustomTextField>
      )
    case 'string':
      return (
        <CustomTextField
          fullWidth
          name={option.key}
          type='text'
          label={option.title}
          value={currentValue}
          InputProps={{ inputProps: { tabIndex: index + 1 } }}
          onChange={handleUpdateReportForm}
        />
      )
    default:
      return <></>
  }
}

const ToolsDataDialog = (props: ToolsDataDialogProps) => {
  const { data, dialogOpen, handleClose, handleSaveData } = props
  const [reportForm, setReportForm] = useState<ReportDataFormType[]>([])
  const { update_data_reports } = useSelector((state: RootState) => state.dataReports)

  useEffect(() => {
    setReportForm(
      data.settings.map((s: any) => {
        return { key: s.key, value: s.value }
      })
    )
  }, [data])

  const handleUpdateReportForm = (e: any) => {
    const foundReport = reportForm.find(report => report.key === e.target.name)
    if (foundReport !== undefined) {
      const newReportForm = reportForm.map(report => {
        if (report.key === e.target.name) {
          return {
            ...report,
            value:
              e.target.type === 'number'
                ? e.target.value
                : e.target.type === 'checkbox'
                ? e.target.checked === true
                  ? '1'
                  : '0'
                : e.target.type === 'string'
                ? e.target.value
                : e.target.value
          }
        } else {
          return report
        }
      })
      setReportForm(newReportForm)
    } else {
      setReportForm([
        ...reportForm,
        {
          key: e.target.name,
          value:
            e.target.type === 'number'
              ? e.target.value
              : e.target.type === 'checkbox'
              ? e.target.checked === true
                ? '1'
                : '0'
              : e.target.type === 'string'
              ? e.target.value
              : e.target.value
        }
      ])
    }
  }

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      open={dialogOpen}
      onClose={handleClose}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogContent
        sx={{
          pb: theme => `${theme.spacing(8)} !important`,
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(12.5)} !important`],
          pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <CustomCloseButton onClick={() => handleClose()}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        <Typography variant='h4' textAlign='center' fontWeight={600} marginBottom={5}>
          {data.school?.name}
        </Typography>
        <form
          autoComplete='off'
          onSubmit={e => {
            e.preventDefault()
            handleSaveData(data.school.id, reportForm)
          }}
        >
          <Grid container spacing={6}>
            {data.settings.map((option: ReportFormOptionScheme, index: number) => (
              <Grid key={index} item xs={6} sm={6}>
                <DataInputs
                  index={index}
                  option={option}
                  reportForm={reportForm}
                  handleUpdateReportForm={handleUpdateReportForm}
                />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ pt: theme => `${theme.spacing(6.5)} !important`, textAlign: 'center' }}>
            <Button variant='contained' type='submit' sx={{ mr: 4 }} disabled={update_data_reports.loading}>
              {update_data_reports.loading ? (
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
            <Button variant='tonal' color='secondary' onClick={handleClose}>
              <Translations text='GoBack' />
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ToolsDataDialog
