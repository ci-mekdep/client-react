// ** React Imports
import { SyntheticEvent, useState, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab, { TabProps } from '@mui/material/Tab'
import MuiTabList, { TabListProps } from '@mui/lab/TabList'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Type Imports
import { SessionType } from 'src/entities/app/SessionType'

// ** Components Imports
import ProfileViewEdit from './tabs/ProfileViewEdit'
import ProfileViewAbout from './tabs/ProfileViewAbout'
import ProfileViewDevices from './tabs/ProfileViewDevices'
import ProfileViewSecurity from './tabs/ProfileViewSecurity'
import ProfileViewSchool from './tabs/ProfileViewSchool'
import ProfileViewDeviceDetail from './tabs/ProfileViewDeviceDetail'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/features/hooks/useAuth'

interface Props {
  tab: string
}

// ** Styled Tab component
const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
  textAlign: 'left',
  justifyContent: 'flex-start',
  flexDirection: 'row',
  '& svg': {
    marginBottom: '0 !important',
    marginRight: theme.spacing(1.5)
  }
}))

const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
  border: 0,
  minWidth: 250,
  '& .MuiTabs-flexContainer': {
    gap: '4px',
    alignItems: 'flex-start',
    '& .MuiTab-root': {
      width: '100%'
    }
  },
  '&, & .MuiTabs-scroller': {
    boxSizing: 'content-box',
    padding: theme.spacing(1.25, 1.25, 2),
    margin: `${theme.spacing(-1.25, -1.25, -2)} !important`
  },
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    lineHeight: 1,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}))

const UserView = ({ tab }: Props) => {
  // ** State
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>(tab)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeSession, setActiveSession] = useState<SessionType | null>(null)

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const { user, current_role } = useAuth()

  const handleChange = (event: SyntheticEvent, value: string) => {
    setIsLoading(true)
    setActiveTab(value)
    if (value === 'excuses') {
      router
        .push({
          pathname: `/users/excuses/${user?.id}`
        })
        .then(() => setIsLoading(false))
    } else {
      router
        .push({
          pathname: `/profile/${value.toLowerCase()}`
        })
        .then(() => setIsLoading(false))
    }
  }

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const handleChangeEdit = () => {
    setIsEdit(!isEdit)
  }

  return (
    <Grid container spacing={6}>
      {isLoading ? (
        ''
      ) : (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: '10px 30px' }}>
            <TabContext value={activeTab}>
              <TabList orientation='vertical' onChange={(e, newValue: string) => handleChange(e, newValue)}>
                <Tab
                  value='about'
                  label={t('ProfilePagesAboutMe')}
                  icon={<Icon fontSize='1.125rem' icon='tabler:user-circle' />}
                />
                <Tab
                  value='school'
                  label={t('ProfilePagesSchool')}
                  icon={<Icon fontSize='1.125rem' icon='tabler:building' />}
                />
                {current_role === 'teacher' && (
                  <Tab
                    value='excuses'
                    label={t('TeacherExcuses')}
                    icon={<Icon fontSize='1.125rem' icon='tabler:file-text' />}
                  />
                )}
                <Tab
                  value='security'
                  label={t('ProfilePagesSecurity')}
                  icon={<Icon fontSize='1.125rem' icon='tabler:lock' />}
                />
                <Tab
                  value='devices'
                  label={t('ProfilePagesDevices')}
                  icon={<Icon fontSize='1.125rem' icon='tabler:devices' />}
                />
              </TabList>
              <TabPanel value='about' sx={{ flexGrow: 1, p: '0 !important', mt: [6, 0] }}>
                {isEdit ? (
                  <ProfileViewEdit handleChangeEdit={handleChangeEdit} />
                ) : (
                  <ProfileViewAbout handleChangeEdit={handleChangeEdit} />
                )}
              </TabPanel>
              <TabPanel value='school' sx={{ flexGrow: 1, p: '0 !important', mt: [6, 0] }}>
                <ProfileViewSchool />
              </TabPanel>
              <TabPanel value='security' sx={{ flexGrow: 1, p: '0 !important', mt: [6, 0] }}>
                <ProfileViewSecurity />
              </TabPanel>
              <TabPanel value='devices' sx={{ flexGrow: 1, p: '0 !important', mt: [6, 0] }}>
                {activeSession === null ? (
                  <ProfileViewDevices setActiveSession={setActiveSession} />
                ) : (
                  <ProfileViewDeviceDetail activeSession={activeSession} setActiveSession={setActiveSession} />
                )}
              </TabPanel>
            </TabContext>
          </Box>
        </Grid>
      )}
    </Grid>
  )
}

export default UserView
