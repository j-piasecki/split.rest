import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import { router } from 'expo-router'
import { useEffect } from 'react'
import { Platform } from 'react-native'

function handleNotification(notification: FirebaseMessagingTypes.RemoteMessage) {
  if (notification?.data?.pathToOpen && typeof notification.data.pathToOpen === 'string') {
    router.navigate(notification.data.pathToOpen)
  }
}

export function useNotificationListener() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      messaging().getInitialNotification().then((notification) => {
        if (notification) {
          handleNotification(notification)
        }
      })

      return messaging().onNotificationOpenedApp((notification) => {
        handleNotification(notification)
      })
    }
  }, [])
}