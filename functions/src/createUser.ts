import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import * as functions from 'firebase-functions/v1'

export const createUser = functions.auth.user().onCreate(async (user) => {
  const db = getFirestore()
  const userRef = db.collection('users').doc(user.uid)

  await userRef.set({
    name: user.displayName || 'Anonymous',
    email: user.email,
    picture: user.photoURL,
    createdAt: FieldValue.serverTimestamp(),
  })

  logger.info(`User ${user.uid} created`)
})
