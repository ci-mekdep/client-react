'use client'

// ** React Imports
import { useEffect, ReactNode } from 'react'

// ** Layout Import
import BlankLayout from 'src/shared/layouts/BlankLayout'

// ** Widget Imports
import ErrorPageWidget from 'src/widgets/general/ErrorPageWidget'

// ** Sentry
import * as Sentry from '@sentry/nextjs'

const ErrorPage = ({ error }: { error: Error & { digest?: string } }) => {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return <ErrorPageWidget />
}

ErrorPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default ErrorPage
