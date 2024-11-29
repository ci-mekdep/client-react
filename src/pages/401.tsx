// ** React Imports
import { ReactNode } from 'react'

// ** Layout Import
import BlankLayout from 'src/shared/layouts/BlankLayout'

// ** Widget Imports
import ErrorPage401 from 'src/widgets/401/ErrorPage401'

const Error401 = () => {
  return <ErrorPage401 />
}

Error401.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default Error401
