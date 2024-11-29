// ** React Imports
import { ReactNode } from 'react'

// ** Layout Import
import BlankLayout from 'src/shared/layouts/BlankLayout'

// ** Widget Imports
import ErrorPage404 from 'src/widgets/404/ErrorPage404'

const Error404 = () => {
  return <ErrorPage404 />
}

Error404.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default Error404
