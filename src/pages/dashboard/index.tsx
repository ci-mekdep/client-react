// ** Widget Imports
import DashboardPage from 'src/widgets/dashboard/DashboardPage'

const Dashboard = () => {
  return <DashboardPage />
}

Dashboard.acl = {
  action: 'read',
  subject: 'dashboard'
}

export default Dashboard
