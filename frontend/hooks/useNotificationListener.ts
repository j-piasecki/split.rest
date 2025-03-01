import messaging from '@react-native-firebase/messaging'
import { useEffect } from 'react'
import { Platform } from 'react-native'

export function useNotificationListener() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      messaging().getInitialNotification().then((notification) => {
        if (notification?.data) {
          alert(`Started from notification: ${JSON.stringify(notification?.data)}`)
        }
      })

      return messaging().onNotificationOpenedApp((notification) => {
        alert(JSON.stringify(notification.data ?? {}))
      })
    }
  }, [])
}