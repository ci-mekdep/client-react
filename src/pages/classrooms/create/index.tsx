import { useAuth } from 'src/features/hooks/useAuth'
import GroupCreate from 'src/widgets/classrooms/create/GroupCreate'
import ClassroomCreate from 'src/widgets/classrooms/create/ClassroomCreate'

const ClassroomCreatePage = () => {
  const { is_secondary_school } = useAuth()

  if (is_secondary_school === false) {
    return <GroupCreate />
  } else {
    return <ClassroomCreate />
  }
}

ClassroomCreatePage.acl = {
  action: 'write',
  subject: 'admin_classrooms'
}

export default ClassroomCreatePage
