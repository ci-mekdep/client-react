import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  IconButtonProps,
  ListItemText,
  styled,
  Typography
} from '@mui/material'
import { SyntheticEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import Translations from 'src/app/layouts/components/Translations'
import { ErrorKeyType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { SchoolTransferUpdateType, SchoolTransferType } from 'src/entities/app/SchoolTransferType'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchClassroomsLite } from 'src/features/store/apps/classrooms'
import { errorTextHandler } from 'src/features/utils/api/errorHandler'
import Icon from 'src/shared/components/icon'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import CustomTextField from 'src/shared/components/mui/text-field'

type PropsType = {
  isAcceptOpen: boolean
  handleCloseAccept: () => void
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

const SchoolTransferAcceptDialog = (props: PropsType) => {
  // ** State
  const { isAcceptOpen, handleCloseAccept, detailData, errors, handleUpdateInboxSchoolTransfer } = props
  const [classroom, setClassroom] = useState<LiteModelType | null>(null)
  const [formData, setFormData] = useState<SchoolTransferUpdateType>({
    id: '',
    target_classroom_id: null,
    receiver_note: '',
    status: 'accepted'
  })

  // ** Hooks
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)

  useEffect(() => {
    if (detailData) {
      setFormData(prev => ({ ...prev, id: detailData.id }))
    }
  }, [detailData])

  useEffect(() => {
    dispatch(fetchClassroomsLite({ limit: 500, offset: 0 }))
  }, [dispatch])

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
        open={isAcceptOpen}
        onClose={handleCloseAccept}
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
          <CustomCloseButton onClick={handleCloseAccept}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <Typography variant='h4' sx={{ mb: 4, textAlign: 'center' }}>
            <Translations text='AcceptSchoolTransfer' />
          </Typography>
          {detailData !== null && (
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <CustomAutocomplete
                  id='target_classroom_id'
                  value={classroom}
                  options={classrooms_lite_list.data}
                  loading={classrooms_lite_list.loading}
                  loadingText={t('ApiLoading')}
                  onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                    setClassroom(newValue)
                    handleFormChange('target_classroom_id', newValue?.key || null)
                  }}
                  noOptionsText={t('NoRows')}
                  renderOption={(props, item) => (
                    <li {...props} key={item.key}>
                      <ListItemText>{item.value}</ListItemText>
                    </li>
                  )}
                  getOptionLabel={option => option.value || ''}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      {...(errors && errors['target_classroom_id']
                        ? { error: true, helperText: errorTextHandler(errors['target_classroom_id']) }
                        : null)}
                      label={t('Classroom')}
                    />
                  )}
                />
              </Grid>
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
          <Button variant='tonal' color='secondary' onClick={handleCloseAccept}>
            <Translations text='GoBack' />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SchoolTransferAcceptDialog
