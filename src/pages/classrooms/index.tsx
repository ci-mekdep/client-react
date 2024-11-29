import { useAuth } from 'src/features/hooks/useAuth'
import GroupsList from 'src/widgets/classrooms/list/GroupsList'
import ClassroomsList from 'src/widgets/classrooms/list/ClassroomsList'

const Classrooms = () => {
  const { is_secondary_school } = useAuth()

  if (is_secondary_school === false) {
    return <GroupsList />
  } else {
    return <ClassroomsList />
  }
}

Classrooms.acl = {
  action: 'read',
  subject: 'admin_classrooms'
}

export default Classrooms
