import { useAuth } from 'src/features/hooks/useAuth'
import PeriodCreate from 'src/widgets/periods/create/PeriodCreate'
import SeasonCreate from 'src/widgets/periods/create/SeasonCreate'

const PeriodCreatePage = () => {
  const { is_secondary_school } = useAuth()

  if (is_secondary_school === false) {
    return <SeasonCreate />
  } else {
    return <PeriodCreate />
  }
}

PeriodCreatePage.acl = {
  action: 'write',
  subject: 'admin_periods'
}

export default PeriodCreatePage
