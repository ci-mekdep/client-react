import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'

const ToolsNotification = () => {
  // ** Hooks
  const router = useRouter()
  const { inbox_notifications } = useSelector((state: RootState) => state.inboxNotifications)

  if (inbox_notifications.data?.items) {
    router.replace(`/tools/notifications/inbox/${inbox_notifications.data.items[0].id}`)
  } else {
    router.replace(`/tools/notifications/inbox/null`)
  }

  return null
}

ToolsNotification.acl = {
  action: 'read',
  subject: 'tool_notifier'
}

export default ToolsNotification
