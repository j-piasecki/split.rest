import * as admin from 'firebase-admin'
import { HttpsError, onCall } from 'firebase-functions/https'
import { Split, UpdateSplitArguments } from 'shared'

// TODO: calculate balance changes here? to be able to confirm it sums up to total

export const updateSplit = onCall(
  {
    region: 'europe-west1',
    cors: true,
    enforceAppCheck: true,
  },
  async (request): Promise<Split> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')
    }

    const data = request.data as Partial<UpdateSplitArguments> | null

    if (!data || !data.title || !data.groupId || !data.total || !data.balances || !data.splitId) {
      throw new HttpsError('invalid-argument', 'Invalid arguments')
    }

    const uid = request.auth.uid
    const splitId = data.splitId
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
        'You do not have permission to update splits in this group'
      )
    }

    return db
      .runTransaction(async (transaction) => {
        const splitData = (
          await db.collection('groups').doc(groupId).collection('entries').doc(splitId).get()
        ).data()

        if (!splitData) {
          throw new HttpsError('not-found', 'Split not found')
        }

        if (splitData.paidBy !== uid && !groupUserData?.admin) {
          throw new HttpsError(
            'permission-denied',
            'You do not have permission to update this split'
          )
        }

        // revert changes from the old split
        for (const { id, change } of splitData.changes) {
          transaction.update(db.collection('groups').doc(groupId).collection('users').doc(id), {
            balance: admin.firestore.FieldValue.increment(-change),
          })
        }

        // apply changes from the new split
        for (const entry of balances) {
          transaction.update(
            db.collection('groups').doc(groupId).collection('users').doc(entry.id),
            {
              balance: admin.firestore.FieldValue.increment(entry.change),
            }
          )
        }

        transaction.update(
          db.collection('groups').doc(groupId).collection('entries').doc(splitId),
          {
            title: title,
            total: total,
            changes: balances.map((entry) => {
              return {
                id: entry.id,
                change: entry.change,
              }
            }),
          }
        )

        return {
          id: splitId,
          title: title,
          total: total,
          timestamp: splitData.timestamp,
          paidById: splitData.paidBy,
          changes: balances,
        }
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
