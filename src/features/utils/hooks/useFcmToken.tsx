import { useEffect, useState } from 'react'
import { getMessaging, getToken, isSupported } from 'firebase/messaging'
import firebaseApp from '../firebase/firebase'

const useFcmToken = () => {
  const [token, setToken] = useState('')
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState('')

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        const messagingSupported = await isSupported()

        if (messagingSupported) {
          if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            const messaging = getMessaging(firebaseApp)

            // Retrieve the notification permission status
            const permission = await Notification.requestPermission()
            setNotificationPermissionStatus(permission)

            // Check if permission is granted before retrieving the token
            if (permission === 'granted') {
              const currentToken = await getToken(messaging, {
                vapidKey: 'BBRuIqyjYHvD5asJmI3W5vxJAm7pgVLUi6SUlf_m1nZO68Gg3u_0PQVmRTG09ZorXI8KmbZlyzDLP-9qNJIR_z8'
              })
              if (currentToken) {
                setToken(currentToken)
              } else {
                console.log('No registration token available. Request permission to generate one.')
              }
            }
          }
        } else {
          console.log('Firebase Messaging is not supported in this browser.')
        }
      } catch (error) {
        console.log('An error occurred while retrieving token:', error)
      }
    }

    retrieveToken()
  }, [])

  return { fcmToken: token, notificationPermissionStatus }
}

export default useFcmToken
