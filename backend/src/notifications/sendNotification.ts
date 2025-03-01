import serviceAccount from '../secrets/notificationServiceAccountKey.json'
import admin from 'firebase-admin'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
})

export function sendNotification(
  token: string,
  title: string,
  body?: string,
  data?: Record<string, string>
): Promise<string> {
  return admin.messaging().send({
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
}
