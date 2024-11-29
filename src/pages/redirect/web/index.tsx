import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import BlankLayout from 'src/shared/layouts/BlankLayout'

const RedirectWebPage = () => {
  const router = useRouter()

  router.push('/login')

  return null
}

RedirectWebPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

RedirectWebPage.guestGuard = true

export default RedirectWebPage
