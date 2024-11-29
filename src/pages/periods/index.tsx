import { useAuth } from 'src/features/hooks/useAuth'
import PeriodsList from 'src/widgets/periods/list/PeriodsList'
import SeasonsList from 'src/widgets/periods/list/SeasonsList'

const Periods = () => {
  const { is_secondary_school } = useAuth()

  if (is_secondary_school === false) {
    return <SeasonsList />
  } else {
    return <PeriodsList />
  }
}

Periods.acl = {
  action: 'read',
  subject: 'admin_periods'
}

export default Periods
