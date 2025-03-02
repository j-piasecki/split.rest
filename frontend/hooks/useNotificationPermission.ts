import { registerOrUpdateNotificationToken } from '@database/registerOrUpdateNotificationToken'
import messaging from '@react-native-firebase/messaging'
import { auth } from '@utils/firebase'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PermissionsAndroid, Platform } from 'react-native'
import { AndroidNotificationChannel } from 'shared'

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
