import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  IconButtonProps,
  styled,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { ErrorKeyType } from 'src/entities/app/GeneralTypes'
import { SchoolTransferUpdateType, SchoolTransferType } from 'src/entities/app/SchoolTransferType'
import { errorTextHandler } from 'src/features/utils/api/errorHandler'
import Icon from 'src/shared/components/icon'
import CustomTextField from 'src/shared/components/mui/text-field'

type PropsType = {
  isRejectOpen: boolean
  handleCloseReject: () => void
  detailData: SchoolTransferType | null
  errors: ErrorKeyType
  handleUpdateInboxSchoolTransfer: (data: SchoolTransferUpdateType) => void
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

const SchoolTransferRejectDialog = (props: PropsType) => {
  // ** State
  const { isRejectOpen, handleCloseReject, detailData, errors, handleUpdateInboxSchoolTransfer } = props
  const [formData, setFormData] = useState<SchoolTransferUpdateType>({
    id: '',
    target_classroom_id: null,
    receiver_note: '',
    status: 'rejected'
  })

  const { t } = useTranslation()

  useEffect(() => {
    if (detailData) {
      setFormData(prev => ({ ...prev, id: detailData.id }))
    }
  }, [detailData])

  const handleFormChange = (
    field: keyof SchoolTransferUpdateType,
    value: SchoolTransferUpdateType[keyof SchoolTransferUpdateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <>
      <Dialog
        fullWidth
        open={isRejectOpen}
        onClose={handleCloseReject}
        maxWidth='md'
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(6)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <CustomCloseButton onClick={handleCloseReject}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <Typography variant='h4' sx={{ mb: 4, textAlign: 'center' }}>
            <Translations text='RejectSchoolTransfer' />
          </Typography>
          {detailData !== null && (
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label={t('ReceiverNote')}
                  value={formData.receiver_note}
                  onChange={e => handleFormChange('receiver_note', e.target.value)}
                  {...(errors && errors['receiver_note']
                    ? { error: true, helperText: errorTextHandler(errors['receiver_note']) }
                    : null)}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button
            color='primary'
            variant='contained'
            sx={{ mr: 2 }}
            onClick={() => handleUpdateInboxSchoolTransfer(formData)}
          >
            <Translations text='Submit' />
          </Button>
          <Button variant='tonal' color='secondary' onClick={handleCloseReject}>
            <Translations text='GoBack' />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SchoolTransferRejectDialog
