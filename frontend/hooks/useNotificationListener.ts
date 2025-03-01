import messaging from '@react-native-firebase/messaging'
import { useEffect } from 'react'

export function useNotificationListener() {
  useEffect(() => {
    messaging().getInitialNotification().then((notification) => {
      if (notification?.data) {
        alert(`Started from notification: ${JSON.stringify(notification?.data)}`)
      }
    })

    return messaging().onNotificationOpenedApp((notification) => {
      alert(JSON.stringify(notification.data ?? {}))
    })
  }, [])
}