// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'

// ** Icon Imports
import Icon from '../../shared/components/icon'

// ** Next Imports
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ** Custom Imports
import { BreadcrumbType } from 'src/entities/app/BreadcrumbPages'
import { generatePathTitles } from 'src/features/utils/generatePathTitles'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/features/hooks/useAuth'

const BreadcrumbsWidget = () => {
  const path = usePathname()
  const { t } = useTranslation()
  const { is_secondary_school } = useAuth()
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbType[]>([])

  useEffect(() => {
    if (path && path.length > 0) {
      if (path.includes('view') || path.includes('edit') || path.includes('create')) {
        setBreadcrumbs(generatePathTitles(path, is_secondary_school))
      }
    }
  }, [is_secondary_school, path, t])

  if ((path && path.includes('view')) || (path && path.includes('edit')) || (path && path.includes('create'))) {
    return (
      <Breadcrumbs aria-label='breadcrumb'>
        <Box mb={4} sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {breadcrumbs.map((breadcrumb, index) => {
            return (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                {breadcrumbs.length !== index + 1 ? (
                  <>
                    <Typography
                      component={Link}
                      href={breadcrumb.url ? breadcrumb.url : ''}
                      sx={{ textDecoration: 'none' }}
                    >
                      {breadcrumb.title}
                    </Typography>
                    <Icon fontSize='1rem' icon='tabler:chevron-right' />
                  </>
                ) : (
                  <>
                    <Typography sx={{ fontWeight: 500 }}>{breadcrumb.title}</Typography>
                  </>
                )}
              </Box>
            )
          })}
        </Box>
      </Breadcrumbs>
    )
  } else {
    return <></>
  }
}

export default BreadcrumbsWidget
