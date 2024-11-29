import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSearchParams } from 'next/navigation'
import { isAndroid, isIOS, isMobile, isDesktop } from 'react-device-detect'
import BlankLayout from 'src/shared/layouts/BlankLayout'

const RedirectPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (router.isReady) {
      const campaign = searchParams.get('utm_campaign') ?? 'qrcode'
      if (isMobile && isAndroid && !isDesktop) {
        const url = new URL('https://play.google.com/store/apps/details')
        url.searchParams.set('id', 'com.emekdep.app')
        url.searchParams.set('launch', 'true')
        url.searchParams.set('utm_campaign', campaign)

        window.location.replace(url.href)
      } else if (isMobile && isIOS && !isDesktop) {
        window.location.replace(`https://apps.apple.com/ru/app/emekdep/id1672835201?utm_campaign=${campaign}`)
      } else {
        const url = new URL('https://play.google.com/store/apps/details')
        url.searchParams.set('id', 'com.emekdep.app')
        url.searchParams.set('launch', 'true')
        url.searchParams.set('utm_campaign', campaign)

        window.location.replace(url.href)
      }
    }
  }, [router.isReady, searchParams])

  return null
}

RedirectPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

RedirectPage.guestGuard = true

export default RedirectPage
