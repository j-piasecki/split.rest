import * as admin from 'firebase-admin'
import { HttpsError, onCall } from 'firebase-functions/https'
import { CreateSplitArguments, Split } from 'shared'

// TODO: calculate balance changes here? to be able to confirm it sums up to total

export const createSplit = onCall(
  {
    region: 'europe-west1',
    cors: true,
    enforceAppCheck: true,
  },
  async (request): Promise<Split> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')
    }

    const data = request.data as Partial<CreateSplitArguments> | null

    if (!data || !data.title || !data.groupId || !data.total || !data.balances) {
      throw new HttpsError('invalid-argument', 'Invalid arguments')
    }

    const uid = request.auth.uid
    const title = data.title
    const groupId = data.groupId
    const total = data.total
    const balances = data.balances

    const db = admin.firestore()

    const groupUserData = (
      await db.collection('groups').doc(groupId).collection('users').doc(uid).get()
    ).data()

    if (!groupUserData?.access) {
      throw new HttpsError(
        'permission-denied',
        'You do not have permission to create splits in this group'
      )
    }

    return db
      .runTransaction(async (transaction) => {
        for (const entry of balances) {
          transaction.update(
            db.collection('groups').doc(groupId).collection('users').doc(entry.id),
            {
              balance: admin.firestore.FieldValue.increment(entry.change),
            }
          )
        }

        const splitDoc = db.collection('groups').doc(groupId).collection('entries').doc()
        const splitData = {
          title: title,
          total: total,
          timestamp: Date.now(),
          paidBy: uid,
          changes: balances.map((entry) => {
            return {
              id: entry.id,
              change: entry.change,
            }
          }),
        }

        transaction.set(splitDoc, splitData)

        return { ...splitData, id: splitDoc.id, paidById: uid }
      })
      .catch(async (error) => {
        if (error.code === 5) {
          const userId = error.details.split('/').pop()
          const userData = (await db.collection('users').doc(userId).get()).data()

          if (userData) {
            throw new HttpsError('not-found', `User ${userData.email} not part of the group`)
          }
        }

        throw error
      })
  }
)
