import serviceAccount from '../secrets/notificationServiceAccountKey.json'
import admin from 'firebase-admin'
import { AndroidNotificationChannel } from 'shared'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
})

export function sendNotification(
  token: string,
  title: string,
  body?: string,
  data?: Record<string, string>,
  androidChannel?: AndroidNotificationChannel
): Promise<string | void> {
  return admin
    .messaging()
    .send({
      token: token,
      notification: {
        title: title,
        body: body,
      },
      data: data,
      android: {
        notification: {
          priority: 'high',
          sound: 'default',
          channelId: androidChannel,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    })
    .catch(() => {
      // Fail silently on notification errors
    })
}
