// ** React Imports
import React, { useEffect, ReactNode } from 'react'

// ** Next Imports
import Head from 'next/head'
import { Router } from 'next/router'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'

// ** Config Imports
import 'src/app/configs/i18n'
import { defaultACLObj } from 'src/app/configs/acl'
import themeConfig from 'src/app/configs/themeConfig'
import { tmLocale } from 'src/app/configs/datePickerLocale'

// ** Third Party Import
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { store } from 'src/features/store'
import { registerLocale } from 'react-datepicker'
import { getMessaging, onMessage } from 'firebase/messaging'

// ** Component Imports
import UserLayout from 'src/app/layouts/UserLayout'
import AclGuard from 'src/shared/components/auth/AclGuard'
import ThemeComponent from 'src/shared/theme/ThemeComponent'
import AuthGuard from 'src/shared/components/auth/AuthGuard'
import GuestGuard from 'src/shared/components/auth/GuestGuard'

// ** Spinner Import
import Spinner from 'src/shared/components/spinner'

// ** Contexts
import { AuthProvider } from 'src/app/context/AuthContext'
import DialogProvider from 'src/app/context/DialogContext'
import { ParamsProvider } from 'src/app/context/ParamsContext'
import { SettingsConsumer, SettingsProvider } from 'src/shared/context/settingsContext'

// ** Styled Components
import ReactHotToast from 'src/shared/styles/libs/react-hot-toast'

// ** Utils Imports
import { createEmotionCache } from 'src/shared/utils/create-emotion-cache'

// ** Prismjs Styles
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'

// ** Firebase Imports
import firebaseApp from 'src/features/utils/firebase/firebase'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'
import 'public/fonts/IBM_Plex_Sans/font.css'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import 'leaflet/dist/leaflet.css'

import 'src/app/iconify-bundle/icons-bundle-react'
import AxiosErrorHandler from 'src/widgets/general/AxiosErrorHandler'
import ErrorBoundary from 'src/widgets/general/ErrorBoundary'

registerLocale('tm', tmLocale)

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage
  emotionCache: EmotionCache
}

type GuardProps = {
  authGuard: boolean
  guestGuard: boolean
  children: ReactNode
}

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

const Guard = ({ children, authGuard, guestGuard }: GuardProps) => {
  if (guestGuard) {
    return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    return <>{children}</>
  } else {
    return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>
  }
}

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  // Variables
  const contentHeightFixed = Component.contentHeightFixed ?? false
  const getLayout =
    Component.getLayout ?? (page => <UserLayout contentHeightFixed={contentHeightFixed}>{page}</UserLayout>)

  const setConfig = Component.setConfig ?? undefined

  const authGuard = Component.authGuard ?? true

  const guestGuard = Component.guestGuard ?? false

  const aclAbilities = Component.acl ?? defaultACLObj

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const messaging = getMessaging(firebaseApp)
      const unsubscribe = onMessage(messaging, payload => {
        new Notification(
          payload.notification && payload.notification.title ? (payload.notification.title as string) : '',
          {
            body: payload.notification?.body,
            icon: '/images/favicon.png'
          }
        ).onclick = event => {
          event.preventDefault()
          window.open(`https://${process.env.NEXT_PUBLIC_DOMAIN}/tools/notifications/inbox/null`, '_blank')
        }
      })

      return () => {
        unsubscribe()
      }
    }
  }, [])

  return (
    <Provider store={store}>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>{`${themeConfig.templateName}`}</title>
          <meta name='description' content={`${themeConfig.templateName} - mekdep dolandyryş ulgamy.`} />
          <meta name='keywords' content='sanly, bilim, mekdep, emekdep, okuw, gundelik, zurnal, sapak, ders, onlayn' />
          <meta name='viewport' content='initial-scale=1, width=device-width' />
        </Head>

        <ParamsProvider>
          <AuthProvider>
            <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
              <SettingsConsumer>
                {({ settings }) => {
                  return (
                    <ThemeComponent settings={settings}>
                      <DialogProvider>
                        <AxiosErrorHandler>
                          <Guard authGuard={authGuard} guestGuard={guestGuard}>
                            <AclGuard aclAbilities={aclAbilities} guestGuard={guestGuard} authGuard={authGuard}>
                              <ErrorBoundary>{getLayout(<Component {...pageProps} />)}</ErrorBoundary>
                            </AclGuard>
                          </Guard>
                        </AxiosErrorHandler>
                      </DialogProvider>
                      <ReactHotToast>
                        <Toaster position={settings.toastPosition} toastOptions={{ className: 'react-hot-toast' }} />
                      </ReactHotToast>
                    </ThemeComponent>
                  )
                }}
              </SettingsConsumer>
            </SettingsProvider>
          </AuthProvider>
        </ParamsProvider>
      </CacheProvider>
    </Provider>
  )
}

export default App
