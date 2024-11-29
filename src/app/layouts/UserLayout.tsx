// ** React Imports
import { ReactNode, useEffect } from 'react'

// ** MUI Imports
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Layout Imports
// !Do not remove this Layout import
import Layout from 'src/shared/layouts/Layout'

// ** Navigation Imports
import VerticalNavItems, { VerticalEduCenterNavItems } from 'src/app/navigation/vertical'

import VerticalAppBarContent from './components/vertical/AppBarContent'

// ** Hook Import
import { useAuth } from 'src/features/hooks/useAuth'
import { useSettings } from 'src/shared/hooks/useSettings'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchUnfilledReportForms } from 'src/features/store/apps/tools/reportForms'

// ** Custom Imports
import Breadcrumbs from 'src/widgets/general/Breadcrumbs'
import AlertWidget from 'src/widgets/general/AlertWidget'
import VerticalNavFooter from 'src/widgets/general/VerticalNavFooter'

interface Props {
  children: ReactNode
  contentHeightFixed?: boolean
}

const UserLayout = ({ children, contentHeightFixed }: Props) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings()

  // ** Vars for server side navigation
  // const { menuItems: verticalMenuItems } = ServerSideVerticalNavItems()

  /**
   *  The below variable will hide the current layout menu at given screen size.
   *  The menu will be accessible from the Hamburger icon only (Vertical Overlay Menu).
   *  You can change the screen size from which you want to hide the current layout menu.
   *  Please refer useMediaQuery() hook: https://mui.com/material-ui/react-use-media-query/,
   *  to know more about what values can be passed to this hook.
   *  ! Do not change this value unless you know what you are doing. It can break the template.
   */
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const { is_secondary_school } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const { report_forms_unfilled } = useSelector((state: RootState) => state.reportForms)
  const totalUnfilled = report_forms_unfilled.data?.total_unfilled

  useEffect(() => {
    dispatch(fetchUnfilledReportForms())

    const interval = setInterval(() => {
      dispatch(fetchUnfilledReportForms())
    }, 180000)

    return () => clearInterval(interval)
  }, [dispatch])

  if (hidden && settings.layout === 'horizontal') {
    settings.layout = 'vertical'
  }

  return (
    <Layout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      contentHeightFixed={contentHeightFixed}
      verticalLayoutProps={{
        navMenu: {
          navItems:
            is_secondary_school === false ? VerticalEduCenterNavItems(totalUnfilled) : VerticalNavItems(totalUnfilled),
          afterContent: () => <VerticalNavFooter settings={settings} />
        },
        appBar: {
          content: props => (
            <VerticalAppBarContent
              hidden={hidden}
              settings={settings}
              saveSettings={saveSettings}
              toggleNavVisibility={props.toggleNavVisibility}
            />
          )
        }
      }}
    >
      <AlertWidget />
      <Breadcrumbs />
      {children}
    </Layout>
  )
}

export default UserLayout
