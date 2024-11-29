// ** React Imports
import { useEffect, useCallback, useState, forwardRef, ReactElement, Ref } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import {
  Button,
  Dialog,
  DialogContent,
  Divider,
  Fade,
  FadeProps,
  Grid,
  IconButton,
  IconButtonProps
} from '@mui/material'
import Icon from 'src/shared/components/icon'
import { useRouter } from 'next/router'
import Translations from './Translations'
import { useAuth } from 'src/features/hooks/useAuth'

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

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

const shortcutKeysFirst = [
  { name: 'Dashboard', keys: ['Alt', '0'] },
  { name: 'Notifications', keys: ['Alt', 'N'] },
  { name: 'Users', keys: ['Alt', '1'] },
  { name: 'Classrooms', keys: ['Alt', '2'] },
  { name: 'Subjects', keys: ['Alt', '3'] },
  { name: 'Timetables', keys: ['Alt', '4'] },
  { name: 'Schools', keys: ['Alt', '5'] },
  { name: 'Shifts', keys: ['Alt', '6'] },
  { name: 'Periods', keys: ['Alt', '7'] },
  { name: 'Courses', keys: ['Alt', '8'] },
  { name: 'Data', keys: ['Alt', '9'] },
  { name: 'Payments', keys: ['Alt', 'U'] }
]

const shortcutKeysSecond = [
  { name: 'ProfilePagesAboutMe', keys: ['Alt', 'P'] },
  { name: 'ShortcutMenu', keys: ['Alt', 'H'] },
  { name: 'SelectSchoolModal', keys: ['Alt', 'S'] },
  { name: 'AddUser', keys: ['Alt', 'Shift', '1'] },
  { name: 'AddClassroom', keys: ['Alt', 'Shift', '2'] },
  { name: 'AddSubject', keys: ['Alt', 'Shift', '3'] },
  { name: 'AddTimetable', keys: ['Alt', 'Shift', '4'] },
  { name: 'AddSchool', keys: ['Alt', 'Shift', '5'] },
  { name: 'AddShift', keys: ['Alt', 'Shift', '6'] },
  { name: 'AddPeriod', keys: ['Alt', 'Shift', '7'] },
  { name: 'AddCourse', keys: ['Alt', 'Shift', '8'] },
  { name: 'ProfilePagesLogout', keys: ['Alt', 'Shift', 'L'] }
]

const HelperDialog = () => {
  // ** States
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  // ** Hooks & Vars
  const theme = useTheme()
  const router = useRouter()
  const { logout } = useAuth()
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    setIsMounted(true)

    return () => setIsMounted(false)
  }, [])
  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      // ** Logout
      if (event.altKey && event.shiftKey && event.which === 76) {
        event.preventDefault()
        setOpenDialog(false)
        logout()
      }

      // ** Create user page
      if (event.altKey && event.shiftKey && event.which === 49) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/users/create')
      } else if (event.altKey && event.which === 49) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/users')
      }

      // ** Create classroom page
      if (event.altKey && event.shiftKey && event.which === 50) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/classrooms/create')
      } else if (event.altKey && event.which === 50) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/classrooms')
      }

      // ** Create subject page
      if (event.altKey && event.shiftKey && event.which === 51) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/subjects/create')
      } else if (event.altKey && event.which === 51) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/subjects')
      }

      // ** Create timetable page
      if (event.altKey && event.shiftKey && event.which === 52) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/timetables/create')
      } else if (event.altKey && event.which === 52) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/timetables')
      }

      // ** Create school page
      if (event.altKey && event.shiftKey && event.which === 53) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/schools/create')
      } else if (event.altKey && event.which === 53) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/schools')
      }

      // ** Create shift page
      if (event.altKey && event.shiftKey && event.which === 54) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/shifts/create')
      } else if (event.altKey && event.which === 54) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/shifts')
      }

      // ** Create period page
      if (event.altKey && event.shiftKey && event.which === 55) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/periods/create')
      } else if (event.altKey && event.which === 55) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/periods')
      }

      // ** Create base subject page
      if (event.altKey && event.shiftKey && event.which === 56) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/base-subjects/create')
      } else if (event.altKey && event.which === 56) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/base-subjects')
      }

      // ** Tools data page
      if (event.altKey && event.which === 57) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/tools/data')
      }

      // ** Payments page
      if (event.altKey && event.which === 85) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/payments')
      }

      // ** Profile page
      if (event.altKey && event.which === 80) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/profile/about')
      }

      // ** Notifications page
      if (event.altKey && event.which === 78) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/tools/notifications/inbox/0')
      }

      // ** Dashboard page
      if (event.altKey && event.which === 48) {
        event.preventDefault()
        setOpenDialog(false)
        router.push('/dashboard')
      }

      if (event.altKey && event.which === 83) {
        event.preventDefault()
        const menuFooterElement = document.querySelector('[data-shortcut-key="school-select"]') as HTMLElement
        if (menuFooterElement) {
          menuFooterElement.click()
        }
      }

      // Open dialog with Alt + H
      if (!openDialog && event.altKey && event.which === 72) {
        setOpenDialog(true)
      }
    },
    [logout, openDialog, router]
  )

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (openDialog && event.keyCode === 27) {
        setOpenDialog(false)
      }
    },
    [openDialog]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyUp, handleKeydown])

  if (!isMounted) {
    return null
  } else {
    return (
      <Box
        onClick={() => !openDialog && setOpenDialog(true)}
        sx={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}
      >
        <IconButton color='inherit' sx={{ mr: 0.5, ml: -1 }}>
          <Icon fontSize='1.625rem' icon='tabler:keyboard' />
        </IconButton>
        {openDialog && (
          <Dialog
            fullWidth
            maxWidth='lg'
            open={openDialog}
            fullScreen={fullScreenDialog}
            onClose={() => setOpenDialog(false)}
            TransitionComponent={Transition}
            onBackdropClick={() => setOpenDialog(false)}
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
          >
            <DialogContent
              sx={{
                pb: theme => `${theme.spacing(8)} !important`,
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
              }}
            >
              <CustomCloseButton onClick={() => setOpenDialog(false)}>
                <Icon icon='tabler:x' fontSize='1.25rem' />
              </CustomCloseButton>
              <Typography variant='h3' textAlign={'center'} fontWeight={600} sx={{ mb: 8 }}>
                <Translations text='ShortcutsManualTitle' />
              </Typography>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  {shortcutKeysFirst.map((data, index) => (
                    <>
                      <Box display='flex' justifyContent='space-between' alignItems='center' my={2}>
                        <Typography>
                          <Translations text={data.name} />
                        </Typography>
                        <Box display='flex' alignItems='center' gap={2}>
                          {data.keys.map((key, innerIndex) => (
                            <>
                              <Button variant='outlined' color='secondary' size='small' disabled>
                                <Typography>{key}</Typography>
                              </Button>
                              {data.keys.length - 1 !== innerIndex && <Typography>+</Typography>}
                            </>
                          ))}
                        </Box>
                      </Box>
                      {shortcutKeysFirst.length - 1 !== index && <Divider />}
                    </>
                  ))}
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  {shortcutKeysSecond.map((data, index) => (
                    <>
                      <Box display='flex' justifyContent='space-between' alignItems='center' my={2}>
                        <Typography>
                          <Translations text={data.name} />
                        </Typography>
                        <Box display='flex' alignItems='center' gap={2}>
                          {data.keys.map((key, innerIndex) => (
                            <>
                              <Button variant='outlined' color='secondary' size='small' disabled>
                                <Typography>{key}</Typography>
                              </Button>
                              {data.keys.length - 1 !== innerIndex && <Typography>+</Typography>}
                            </>
                          ))}
                        </Box>
                      </Box>
                      {shortcutKeysSecond.length - 1 !== index && <Divider />}
                    </>
                  ))}
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>
        )}
      </Box>
    )
  }
}

export default HelperDialog
