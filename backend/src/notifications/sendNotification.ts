import admin from 'firebase-admin'
import { AndroidNotificationChannel } from 'shared'

let serviceAccount: any = null

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  serviceAccount = require('../secrets/notificationServiceAccountKey.json')
} catch {
  console.warn('No service account found, notifications will not be sent')
}

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
  if (!serviceAccount) {
    return Promise.resolve()
  }

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
