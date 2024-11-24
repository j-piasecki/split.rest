import * as admin from 'firebase-admin'
import { HttpsError, onCall } from 'firebase-functions/https'
import { SetGroupHiddenArguments } from 'shared'

export const setGroupHidden = onCall(
  {
    region: 'europe-west1',
    cors: true,
    enforceAppCheck: true,
  },
  async (request): Promise<void> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')
    }

    const data = request.data as Partial<SetGroupHiddenArguments> | null

    if (!data || !data.groupId || data.hidden === undefined) {
      throw new HttpsError('invalid-argument', 'Invalid arguments')
    }

    const uid = request.auth.uid
    const groupId = data.groupId
    const hidden = data.hidden

    const db = admin.firestore()

    return db.runTransaction(async (transaction) => {
      transaction.update(db.collection('groups').doc(groupId).collection('users').doc(uid), {
        hidden: hidden,
      })

      transaction.update(db.collection('users').doc(uid).collection('data').doc('groups'), {
        hidden: hidden
          ? admin.firestore.FieldValue.arrayUnion(groupId)
          : admin.firestore.FieldValue.arrayRemove(groupId),
      })
    })
  }
)
