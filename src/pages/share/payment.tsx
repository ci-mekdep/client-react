import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/router'
import BlankLayout from 'src/shared/layouts/BlankLayout'

const SharePayment = () => {
  const router = useRouter()

  useEffect(() => {
    router.replace('/redirect/app')
  }, [router])

  return null
}

SharePayment.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

SharePayment.guestGuard = true

export default SharePayment
