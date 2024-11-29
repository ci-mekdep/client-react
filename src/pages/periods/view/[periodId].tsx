import { useAuth } from 'src/features/hooks/useAuth'
import PeriodView from 'src/widgets/periods/view/PeriodView'
import SeasonView from 'src/widgets/periods/view/SeasonView'

const PeriodViewPage = () => {
  const { is_secondary_school } = useAuth()

  if (is_secondary_school === false) {
    return <SeasonView />
  } else {
    return <PeriodView />
  }
}

PeriodViewPage.acl = {
  action: 'read',
  subject: 'admin_periods'
}

export default PeriodViewPage
