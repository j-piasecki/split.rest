import * as admin from 'firebase-admin'
import { HttpsError, onCall } from 'firebase-functions/https'

export const createGroup = onCall(
  {
    region: 'europe-west1',
    cors: true,
    enforceAppCheck: true,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')
    }

    if (!request.data || !request.data.name || !request.data.currency) {
      throw new HttpsError('invalid-argument', 'Invalid arguments')
    }

    const uid = request.auth.uid
    const name = request.data.name
    const currency = request.data.currency

    const db = admin.firestore()

    const groupDoc = await db.collection('groups').add({
      name: name,
      currency: currency,
      memberCount: 1,
    })

    await groupDoc.collection('users').doc(uid).set({
      admin: true,
      access: true,
      hidden: false,
      balance: 0,
    })

    await db
      .collection('users')
      .doc(uid)
      .collection('data')
      .doc('groups')
      .update({
        groups: admin.firestore.FieldValue.arrayUnion(groupDoc.id),
      })

    return {
      id: groupDoc.id,
      name: name,
      currency: currency,
      hidden: false,
      isAdmin: true,
      hasAccess: true,
      memberCount: 1,
    }
  }
)
