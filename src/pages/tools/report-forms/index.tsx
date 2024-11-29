import { useAuth } from 'src/features/hooks/useAuth'
import ReportFormsListAdmin from 'src/widgets/tools/reportForms/ReportFormListAdmin'
import ReportFormsListPrincipal from 'src/widgets/tools/reportForms/ReportFormListPrincipal'

const ReportForms = () => {
  const { current_role } = useAuth()

  if (current_role === 'admin') {
    return <ReportFormsListAdmin />
  } else {
    return <ReportFormsListPrincipal />
  }
}

ReportForms.acl = {
  action: 'read',
  subject: 'tool_report_forms'
}

export default ReportForms
