import { useAuth } from 'src/features/hooks/useAuth'
import PeriodEdit from 'src/widgets/periods/edit/PeriodEdit'
import SeasonEdit from 'src/widgets/periods/edit/SeasonEdit'

const PeriodEditPage = () => {
  const { is_secondary_school } = useAuth()

  if (is_secondary_school === false) {
    return <SeasonEdit />
  } else {
    return <PeriodEdit />
  }
}

PeriodEditPage.acl = {
  action: 'write',
  subject: 'admin_periods'
}

export default PeriodEditPage
