// ** React Imports
import { ReactNode } from 'react'

// ** Layout Import
import BlankLayout from 'src/shared/layouts/BlankLayout'

// ** Widget Imports
import ErrorPage500 from 'src/widgets/500/ErrorPage500'

const Error500 = () => {
  return <ErrorPage500 />
}

Error500.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default Error500
