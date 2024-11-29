// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Hook Imports
import { useAuth } from 'src/features/hooks/useAuth'

// ** Type Import
import { Settings } from 'src/shared/context/settingsContext'

// ** Components
import ModeToggler from 'src/shared/layouts/components/shared-components/ModeToggler'
import LanguageDropdown from 'src/shared/layouts/components/shared-components/LanguageDropdown'
import NotificationDropdown from 'src/widgets/notifications/NotificationDropdown'
import UserDropdown from 'src/widgets/general/UserDropdown'
import AppBarTitle from 'src/widgets/general/AppBarTitle'
import HelperDialog from 'src/app/layouts/components/HelperDialog'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

const AppBarContent = (props: Props) => {
  const router = useRouter()

  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props
  const { user } = useAuth()

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden ? (
          <IconButton color='inherit' sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
            <Icon fontSize='1.5rem' icon='tabler:menu-2' />
          </IconButton>
        ) : null}
        {user && <HelperDialog />}
        <AppBarTitle path={router.pathname} />
      </Box>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <LanguageDropdown />
        <ModeToggler settings={settings} saveSettings={saveSettings} />
        <NotificationDropdown />
        <UserDropdown />
      </Box>
    </Box>
  )
}

export default AppBarContent
