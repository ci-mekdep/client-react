import { useAuth } from 'src/features/hooks/useAuth'
import GroupEdit from 'src/widgets/classrooms/edit/GroupEdit'
import ClassroomEdit from 'src/widgets/classrooms/edit/ClassroomEdit'

const ClassroomEditPage = () => {
  const { is_secondary_school } = useAuth()

  if (is_secondary_school === false) {
    return <GroupEdit />
  } else {
    return <ClassroomEdit />
  }
}

ClassroomEditPage.acl = {
  action: 'write',
  subject: 'admin_classrooms'
}

export default ClassroomEditPage
