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

  const userGroupsRef = userRef.collection('data').doc('groups')

  await userGroupsRef.set({
    groups: [],
    hidden: [],
  })

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await db.collection('email2uid').doc(user.email!).set({
    email: user.uid,
  })

  logger.info(`User ${user.uid} created`)
})
