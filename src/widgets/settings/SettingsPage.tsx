// ** React Imports
import { SyntheticEvent, useState, useEffect, useContext } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab, { TabProps } from '@mui/material/Tab'
import MuiTabList, { TabListProps } from '@mui/lab/TabList'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Third Party Imports
import { useTranslation } from 'react-i18next'

// ** Components Imports
import BooksList from 'src/pages/books'
import TopicsList from 'src/pages/topics'
import LogsList from 'src/pages/tools/logs'
import ContactItemsList from 'src/pages/contact/items'
import LessonSettingsTab from './tabs/LessonSettingsTab'
import SubjectSettingsTab from './tabs/SubjectSettingsTab'
import GeneralSettingsTab from './tabs/GeneralSettingsTab'
import GeneralSettingsEdit from './tabs/GeneralSettingsEdit'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'

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

// ** Styled TabList component
const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
  borderBottom: '0 !important',
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

const SettingsPage = ({ tab }: Props) => {
  // ** State
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>(tab)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const ability = useContext(AbilityContext)

  const handleChange = (event: SyntheticEvent, value: string) => {
    setIsLoading(true)
    setActiveTab(value)
    router
      .push({
        pathname: `/settings/${value.toLowerCase()}`
      })
      .then(() => setIsLoading(false))
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
          <TabContext value={activeTab}>
            <TabList variant='scrollable' onChange={(e, newValue: string) => handleChange(e, newValue)}>
              {ability.can('read', 'admin_settings') && (
                <Tab
                  value='general'
                  label={t('GeneralSettings')}
                  icon={<Icon fontSize='1.125rem' icon='tabler:settings' />}
                />
              )}
              {ability.can('read', 'admin_settings') && (
                <Tab
                  value='lesson'
                  label={t('LessonSettings')}
                  icon={<Icon fontSize='1.125rem' icon='tabler:box-multiple' />}
                />
              )}
              {ability.can('read', 'admin_settings') && (
                <Tab
                  value='subject'
                  label={t('SubjectSettings')}
                  icon={<Icon fontSize='1.125rem' icon='tabler:file-settings' />}
                />
              )}
              {ability.can('read', 'admin_books') && (
                <Tab value='books' label={t('Books')} icon={<Icon fontSize='1.125rem' icon='tabler:books' />} />
              )}
              {ability.can('read', 'admin_topics') && (
                <Tab value='topics' label={t('Topics')} icon={<Icon fontSize='1.125rem' icon='tabler:article' />} />
              )}
              {ability.can('read', 'admin_contact_items') && (
                <Tab
                  value='contact-items'
                  label={t('ContactItems')}
                  icon={<Icon fontSize='1.125rem' icon='tabler:mail' />}
                />
              )}
              {ability.can('read', 'tool_logs') && (
                <Tab value='user-logs' label={t('Logs')} icon={<Icon fontSize='1.125rem' icon='tabler:logs' />} />
              )}
            </TabList>
            {ability.can('read', 'admin_settings') && (
              <TabPanel value='general' sx={{ flexGrow: 1, p: '0 !important', mt: [6, 0] }}>
                {isEdit ? (
                  <GeneralSettingsEdit handleChangeEdit={handleChangeEdit} />
                ) : (
                  <GeneralSettingsTab handleChangeEdit={handleChangeEdit} />
                )}
              </TabPanel>
            )}
            {ability.can('read', 'admin_settings') && (
              <TabPanel value='lesson' sx={{ flexGrow: 1, p: '0 !important', mt: [6, 0] }}>
                <LessonSettingsTab />
              </TabPanel>
            )}
            {ability.can('read', 'admin_settings') && (
              <TabPanel value='subject' sx={{ flexGrow: 1, p: '0 !important', mt: [6, 0] }}>
                <SubjectSettingsTab />
              </TabPanel>
            )}
            {ability.can('read', 'admin_books') && (
              <TabPanel value='books' sx={{ flexGrow: 1, p: '0 !important', mt: [6, 0] }}>
                <BooksList />
              </TabPanel>
            )}
            {ability.can('read', 'admin_topics') && (
              <TabPanel value='topics' sx={{ flexGrow: 1, p: '0 !important', mt: [6, 0] }}>
                <TopicsList />
              </TabPanel>
            )}
            {ability.can('read', 'admin_contact_items') && (
              <TabPanel value='contact-items' sx={{ flexGrow: 1, p: '0 !important', mt: [6, 0] }}>
                <ContactItemsList />
              </TabPanel>
            )}
            {ability.can('read', 'tool_logs') && (
              <TabPanel value='user-logs' sx={{ flexGrow: 1, p: '0 !important', mt: [6, 0] }}>
                <LogsList />
              </TabPanel>
            )}
          </TabContext>
        </Grid>
      )}
    </Grid>
  )
}

export default SettingsPage
