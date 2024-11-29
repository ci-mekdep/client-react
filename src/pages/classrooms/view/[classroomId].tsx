import { useAuth } from 'src/features/hooks/useAuth'
import GroupView from 'src/widgets/classrooms/view/GroupView'
import ClassroomView from 'src/widgets/classrooms/view/ClassroomView'

const ClassroomViewPage = () => {
  const { is_secondary_school } = useAuth()

  if (is_secondary_school === false) {
    return <GroupView />
  } else {
    return <ClassroomView />
  }
}

ClassroomViewPage.acl = {
  action: 'read',
  subject: 'admin_classrooms'
}

export default ClassroomViewPage
