import { Dialog, DialogContent, IconButton, IconButtonProps, Typography, styled } from '@mui/material'
import Translations from 'src/app/layouts/components/Translations'
import Icon from 'src/shared/components/icon'

type PropsType = {
  dialogOpen: boolean
  handleClose: () => void
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

const SubjectImportModal = (props: PropsType) => {
  const { dialogOpen, handleClose } = props

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
          px: 0,
          pb: 0,
          pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <CustomCloseButton onClick={() => handleClose()}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        <Typography variant='h4' textAlign='center' fontWeight={600} marginBottom={5}>
          <Translations text='SubjectImportModalTitle' />
        </Typography>
        <Typography variant='body1' textAlign='justify'>
          <Translations text='HowToImportText' />
        </Typography>
      </DialogContent>
    </Dialog>
  )
}

export default SubjectImportModal
