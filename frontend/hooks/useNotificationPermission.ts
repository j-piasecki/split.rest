import { registerOrUpdateNotificationToken } from '@database/registerOrUpdateNotificationToken'
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging'
import { auth } from '@utils/firebase'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PermissionsAndroid, Platform } from 'react-native'
import { AndroidNotificationChannel } from 'shared'

async function requestPermissionAndGetToken(): Promise<string | null> {
  if (Platform.OS === 'ios') {
    const messaging = getMessaging()
    const authStatus = await messaging.requestPermission()
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL

    if (enabled) {
      await registerDeviceForRemoteMessages(messaging)
      return await getToken(messaging)
    }
  } else if (Platform.OS === 'android') {
    const messaging = getMessaging()
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    )

    if (status === 'granted') {
      await registerDeviceForRemoteMessages(messaging)
      return await getToken(messaging)
    }
  }

  return null
}

export function useNotificationPermission() {
  const { t } = useTranslation()

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync(AndroidNotificationChannel.NewSplits, {
        name: t('notification.channel.newSplits'),
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        enableVibrate: true,
      })

      Notifications.setNotificationChannelAsync(AndroidNotificationChannel.SplitUpdates, {
        name: t('notification.channel.splitUpdates'),
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        enableVibrate: true,
      })

      Notifications.setNotificationChannelAsync(AndroidNotificationChannel.GroupInvites, {
        name: t('notification.channel.groupInvites'),
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        enableVibrate: true,
      })

      Notifications.setNotificationChannelAsync(AndroidNotificationChannel.GroupUpdates, {
        name: t('notification.channel.groupUpdates'),
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        enableVibrate: true,
      })
    }

    if (Platform.OS !== 'web') {
      async function tryUpdateToken() {
        const token = await requestPermissionAndGetToken()
        if (token && auth.currentUser) {
          await registerOrUpdateNotificationToken(token)
        }
      }

      tryUpdateToken()
    }
  }, [t])
}
