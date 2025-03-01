import { registerOrUpdateNotificationToken } from '@database/registerOrUpdateNotificationToken'
import messaging from '@react-native-firebase/messaging'
import { useEffect } from 'react'
import { PermissionsAndroid, Platform } from 'react-native'
import { auth } from '@utils/firebase'

async function requestPermissionAndGetToken(): Promise<string | null> {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (enabled) {
      await messaging().registerDeviceForRemoteMessages()
      return await messaging().getToken()
    }
  } else if (Platform.OS === 'android') {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    )

    if (status === 'granted') {
      await messaging().registerDeviceForRemoteMessages()
      return await messaging().getToken()
    }
  }

  return null
}

export async function useNotificationPermission() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      async function tryUpdateToken() {
        const token = await requestPermissionAndGetToken()
        if (token && auth.currentUser) {
          await registerOrUpdateNotificationToken(token)
        }
      }

      tryUpdateToken()
    }
  }, [])
}