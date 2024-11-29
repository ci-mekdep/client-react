// ** MUI Imports
import { Dialog } from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { styled } from '@mui/material/styles'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import { Fragment, createContext, useContext, useState } from 'react'
import Icon from 'src/shared/components/icon'
import { Box, Button, Typography } from '@mui/material'
import Translations from '../layouts/components/Translations'

interface PromiseInfo {
  resolve: (value: boolean | PromiseLike<boolean>) => void
  reject: (reason?: any) => void
}

type ShowDialogHandler = () => Promise<boolean>

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

const DialogContext = createContext<ShowDialogHandler>(() => {
  throw new Error('Component is not wrapped with a DialogProvider.')
})

const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [promiseInfo, setPromiseInfo] = useState<PromiseInfo>()
  const showDialog: ShowDialogHandler = () => {
    return new Promise<boolean>((resolve, reject) => {
      setPromiseInfo({ resolve, reject })
      setOpen(true)
    })
  }

  const handleConfirm = () => {
    setOpen(false)
    promiseInfo?.resolve(true)
    setPromiseInfo(undefined)
  }

  const handleCancel = () => {
    setOpen(false)
    promiseInfo?.resolve(false)
    setPromiseInfo(undefined)
  }

  return (
    <Fragment>
      <Dialog
        fullWidth
        open={open}
        onClose={handleCancel}
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 512 }, '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(6)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <CustomCloseButton onClick={handleCancel}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <Box
            sx={{
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
              '& svg': { mb: 6, color: 'error.main' }
            }}
          >
            <Icon icon='tabler:trash' fontSize='5rem' />
            <Typography variant='h3' mb={4}>
              <Translations text='DialogTitle' />
            </Typography>
            <Typography>
              <Translations text='DialogText' />
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button data-cy='dialog-submit' color='error' variant='contained' sx={{ mr: 2 }} onClick={handleConfirm}>
            <Translations text='DialogDeleteButton' />
          </Button>
          <Button variant='tonal' color='secondary' onClick={handleCancel}>
            <Translations text='GoBack' />
          </Button>
        </DialogActions>
      </Dialog>
      <DialogContext.Provider value={showDialog}>{children}</DialogContext.Provider>
    </Fragment>
  )
}

export const useDialog = () => {
  return useContext(DialogContext)
}

export default DialogProvider
