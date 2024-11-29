// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js')
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js')

const firebaseConfig = {
  apiKey: 'AIzaSyA1WV3NwSU6ADpF63bijgkAnxcU_yq3Ayg',
  authDomain: 'emekdeporg.firebaseapp.com',
  projectId: 'emekdeporg',
  storageBucket: 'emekdeporg.appspot.com',
  messagingSenderId: '963880719815',
  appId: '1:963880719815:web:f804dd69ef4c9ab617f5e2',
  measurementId: 'G-KB0BWE918V'
}
// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig)

let messaging = null
if (firebase.messaging.isSupported()) {
  messaging = firebase.messaging()
}

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  let url = `https://${self.location.hostname}/tools/notifications/inbox/null`
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientsArr => {
      const hadWindowToFocus = clientsArr.some(windowClient =>
        windowClient.url === url ? (windowClient.focus(), true) : false
      )
      if (!hadWindowToFocus) clients.openWindow(url).then(windowClient => (windowClient ? windowClient.focus() : null))
    })
  )
})

messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload)
  const notificationTitle = payload.notification.title ? payload.notification.title : ''
  const notificationOptions = {
    title: payload.notification.title,
    body: payload.notification.body,
    icon: '/images/favicon.png'
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})
