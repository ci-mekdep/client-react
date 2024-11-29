// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** Navigation Imports
import { appBarTitles } from 'src/app/configs/appBarTitles'

// ** MUI Imports
import { Typography } from '@mui/material'
import { useAuth } from 'src/features/hooks/useAuth'
import Translations from 'src/app/layouts/components/Translations'

interface Props {
  path: string
}

const AppBarTitle = (props: Props) => {
  const [activeTitle, setActiveTitle] = useState<string>()

  const { is_secondary_school } = useAuth()

  useEffect(() => {
    const active_route = appBarTitles.find(item => props.path.startsWith(item.path))
    if (active_route !== undefined) {
      setActiveTitle(
        is_secondary_school === false && active_route.secondTitle ? active_route.secondTitle : active_route.title
      )
    }
  }, [is_secondary_school, props.path])

  return (
    <Fragment>
      <Typography variant='h5'>
        <Translations text={activeTitle as string} />
      </Typography>
    </Fragment>
  )
}

export default AppBarTitle
