// ** React Imports
import { useState, SyntheticEvent, Fragment } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { Theme } from '@mui/material/styles'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Context
import { useAuth } from 'src/features/hooks/useAuth'

// ** Helpers Import
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { renderRole } from 'src/features/utils/ui/renderRole'
import Translations from 'src/app/layouts/components/Translations'

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const MenuItemStyled = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
  '&:hover .MuiBox-root, &:hover .MuiBox-root svg': {
    color: theme.palette.primary.main
  }
}))

const UserDropdown = () => {
  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  // ** Hooks
  const router = useRouter()
  const { user, logout, current_role } = useAuth()

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = (url?: string) => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  const styles = {
    px: 4,
    py: 1.75,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2.5,
      fontSize: '1.5rem',
      color: 'text.secondary'
    }
  }

  const handleLogout = () => {
    logout()
    handleDropdownClose()
  }

  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  return (
    <Fragment>
      {!hidden && (
        <Box
          data-cy='profile-avatar'
          sx={{ display: 'flex', ml: 2.5, alignItems: 'flex-end', flexDirection: 'column', cursor: 'pointer' }}
          onClick={handleDropdownOpen}
        >
          <Typography sx={{ fontWeight: 500 }}>
            {renderUserFullname(user?.last_name, user?.first_name, user?.middle_name)}
          </Typography>
          <Typography variant='body2'>{renderRole(current_role as string)}</Typography>
        </Box>
      )}
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <Avatar
          alt={user?.first_name + ' ' + user?.last_name}
          src={user?.avatar}
          onClick={handleDropdownOpen}
          sx={{ width: 38, height: 38 }}
        />
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4.75 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItemStyled data-cy='dropdown-about' sx={{ p: 0 }} onClick={() => handleDropdownClose('/profile/about')}>
          <Box sx={styles}>
            <Icon icon='tabler:user-circle' />
            <Translations text='ProfilePagesAboutMe' />
          </Box>
        </MenuItemStyled>
        <MenuItemStyled data-cy='dropdown-school' sx={{ p: 0 }} onClick={() => handleDropdownClose('/profile/school')}>
          <Box sx={styles}>
            <Icon icon='tabler:building' />
            <Translations text='ProfilePagesSchool' />
          </Box>
        </MenuItemStyled>
        {current_role === 'teacher' && (
          <MenuItemStyled
            data-cy='dropdown-excuses'
            sx={{ p: 0 }}
            onClick={() => router.push(`/users/excuses/${user?.id}`)}
          >
            <Box sx={styles}>
              <Icon icon='tabler:file-text' />
              <Translations text='TeacherExcuses' />
            </Box>
          </MenuItemStyled>
        )}
        <MenuItemStyled
          data-cy='dropdown-security'
          sx={{ p: 0 }}
          onClick={() => handleDropdownClose('/profile/security')}
        >
          <Box sx={styles}>
            <Icon icon='tabler:lock' />
            <Translations text='ProfilePagesSecurity' />
          </Box>
        </MenuItemStyled>
        <MenuItemStyled
          data-cy='dropdown-devices'
          sx={{ p: 0 }}
          onClick={() => handleDropdownClose('/profile/devices')}
        >
          <Box sx={styles}>
            <Icon icon='tabler:devices' />
            <Translations text='ProfilePagesDevices' />
          </Box>
        </MenuItemStyled>
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
        <MenuItemStyled data-cy='dropdown-logout' sx={{ p: 0 }} onClick={handleLogout}>
          <Box sx={styles}>
            <Icon icon='tabler:logout' />
            <Translations text='ProfilePagesLogout' />
          </Box>
        </MenuItemStyled>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
