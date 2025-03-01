/* eslint-disable @typescript-eslint/no-require-imports */
import admin = require('firebase-admin')
import serviceAccount = require('../secrets/notificationServiceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
})

function sendNotification(
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
