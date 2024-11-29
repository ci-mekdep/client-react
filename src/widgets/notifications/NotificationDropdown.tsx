// ** React Imports
import { useState, SyntheticEvent, Fragment, ReactNode, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { styled, Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiMenu, { MenuProps } from '@mui/material/Menu'
import MuiMenuItem, { MenuItemProps } from '@mui/material/MenuItem'
import Typography, { TypographyProps } from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Third Party Components
import format from 'date-fns/format'
import { useRouter } from 'next/router'
import PerfectScrollbarComponent from 'react-perfect-scrollbar'

// ** Type Imports
import { UserNotificationType } from 'src/entities/app/NotificationType'

// ** Custom Components Imports
import Translations from 'src/app/layouts/components/Translations'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchInboxNotifications } from 'src/features/store/apps/inboxNotifications'

// ** Styled Menu component
const Menu = styled(MuiMenu)<MenuProps>(({ theme }) => ({
  '& .MuiMenu-paper': {
    width: 380,
    overflow: 'hidden',
    marginTop: theme.spacing(4.25),
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  '& .MuiMenu-list': {
    padding: 0,
    '& .MuiMenuItem-root': {
      margin: 0,
      borderRadius: 0,
      padding: theme.spacing(4, 6),
      '&:hover': {
        backgroundColor: theme.palette.action.hover
      }
    }
  }
}))

// ** Styled MenuItem component
const MenuItem = styled(MuiMenuItem)<MenuItemProps>(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}))

// ** Styled PerfectScrollbar component
const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  maxHeight: 349
})

// ** Styled component for the title in MenuItems
const MenuItemTitle = styled(Typography)<TypographyProps>({
  fontWeight: 500,
  whiteSpace: 'normal'
})

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <Box sx={{ maxHeight: 349, overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>{children}</PerfectScrollbar>
  }
}

const NotificationDropdown = () => {
  // ** States
  const [anchorEl, setAnchorEl] = useState<(EventTarget & Element) | null>(null)

  // ** Hooks
  const router = useRouter()
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

  const dispatch = useDispatch<AppDispatch>()
  const { inbox_notifications } = useSelector((state: RootState) => state.inboxNotifications)

  useEffect(() => {
    dispatch(
      fetchInboxNotifications({
        limit: 12,
        offset: 0
      })
    )
  }, [dispatch])

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  const gotoNotificationsList = (id: string | null) => {
    setAnchorEl(null)
    router.replace(`/tools/notifications/inbox/${id}`)
  }

  return (
    <Fragment>
      <IconButton color='inherit' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='customized-menu'>
        <Badge
          max={99}
          color='error'
          badgeContent={inbox_notifications.total_unread}
          invisible={!inbox_notifications.data.length}
          sx={{
            '& .MuiBadge-badge': { top: 4, right: 4, boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}` }
          }}
        >
          <Icon fontSize='1.625rem' icon='tabler:bell' />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          disableRipple
          disableTouchRipple
          sx={{ cursor: 'default', userSelect: 'auto', backgroundColor: 'transparent !important' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant='h5' sx={{ cursor: 'text' }}>
              <Translations text='Notifications' />
            </Typography>
          </Box>
        </MenuItem>
        <ScrollWrapper hidden={hidden}>
          {inbox_notifications.data?.length !== 0 ? (
            inbox_notifications.data?.map((notification: UserNotificationType, index: number) => (
              <MenuItem
                key={index}
                disableRipple
                disableTouchRipple
                onClick={() => {
                  gotoNotificationsList(notification.id)
                }}
              >
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Badge
                    variant='dot'
                    color='primary'
                    badgeContent={inbox_notifications.data.length}
                    invisible={notification.read_at !== null}
                    sx={{
                      '& .MuiBadge-badge': {
                        top: 4,
                        right: 4,
                        boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`
                      }
                    }}
                  >
                    <MenuItemTitle>{notification.notification?.title}</MenuItemTitle>
                  </Badge>
                  <Typography sx={{ color: 'text.disabled' }}>
                    {notification?.notification?.created_at &&
                      format(new Date(notification.notification.created_at), 'dd.MM.yyyy HH:mm')}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem disableRipple disableTouchRipple>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Translations text='NoRows' />
              </Box>
            </MenuItem>
          )}
        </ScrollWrapper>
        <MenuItem
          disableRipple
          disableTouchRipple
          sx={{
            borderBottom: 0,
            cursor: 'default',
            userSelect: 'auto',
            backgroundColor: 'transparent !important',
            borderTop: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          <Button
            fullWidth
            variant='contained'
            onClick={() => {
              if (inbox_notifications.data[0]) {
                gotoNotificationsList(inbox_notifications.data[0].id)
              } else {
                gotoNotificationsList(null)
              }
            }}
          >
            <Translations text='ReadAllNotifications' />
          </Button>
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default NotificationDropdown
