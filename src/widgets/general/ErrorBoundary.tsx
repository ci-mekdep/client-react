import React, { ReactNode, ErrorInfo } from 'react'

import * as Sentry from '@sentry/nextjs'
import ErrorPageWidget from './ErrorPageWidget'
import BlankLayout from 'src/shared/layouts/BlankLayout'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    Sentry.captureException(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <BlankLayout>
          <ErrorPageWidget />
        </BlankLayout>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
