import * as admin from 'firebase-admin'
import { HttpsError, onCall } from 'firebase-functions/https'
import { DeleteSplitArguments } from 'shared'

export const deleteSplit = onCall(
  {
    region: 'europe-west1',
    cors: true,
    enforceAppCheck: true,
  },
  async (request): Promise<void> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')
    }

    const data = request.data as Partial<DeleteSplitArguments> | null

    if (!data || !data.splitId || !data.groupId) {
      throw new HttpsError('invalid-argument', 'Invalid arguments')
    }

    const uid = request.auth.uid
    const splitId = data.splitId
    const groupId = data.groupId

    const db = admin.firestore()

    return db.runTransaction(async (transaction) => {
      const splitData = (
        await transaction.get(
          db.collection('groups').doc(groupId).collection('entries').doc(splitId)
        )
      ).data()

      if (!splitData) {
        throw new HttpsError('not-found', 'Split not found')
      }

      const groupUserData = (
        await transaction.get(db.collection('groups').doc(groupId).collection('users').doc(uid))
      ).data()

      if (!groupUserData?.admin) {
        if (splitData.paidBy !== uid) {
          throw new HttpsError(
            'permission-denied',
            'You do not have permission to delete this split'
          )
        } else if (!groupUserData?.access) {
          throw new HttpsError(
            'permission-denied',
            'You do not have permission to modify this group'
          )
        }
      }

      for (const { id, change } of splitData.changes) {
        transaction.update(db.collection('groups').doc(groupId).collection('users').doc(id), {
          balance: admin.firestore.FieldValue.increment(-change),
        })
      }

      transaction.delete(db.collection('groups').doc(groupId).collection('entries').doc(splitId))
    })
  }
)
