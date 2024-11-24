import * as admin from 'firebase-admin'
import { HttpsError, onCall } from 'firebase-functions/https'
import { GetGroupSplitsArguments, Split } from 'shared'

export const getGroupSplits = onCall(
  {
    region: 'europe-west1',
    cors: true,
    enforceAppCheck: true,
  },
  async (request): Promise<Split[]> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')
    }

    const data = request.data as Partial<GetGroupSplitsArguments> | null

    if (!data || !data.groupId) {
      throw new HttpsError('invalid-argument', 'Invalid arguments')
    }

    const groupId = data.groupId
    const startAfter = data.startAfterTimestamp

    const db = admin.firestore()

    let query = db
      .collection('groups')
      .doc(groupId)
      .collection('entries')
      .orderBy('timestamp', 'desc')
      .limit(10)

    if (startAfter) {
      query = query.startAfter(startAfter)
    }

    const entriesData = await query.get()
    const result: Split[] = []

    entriesData.forEach((split) => {
      const splitData = split.data()
      result.push({
        id: split.id,
        title: splitData.title,
        total: splitData.total,
        timestamp: splitData.timestamp,
        paidById: splitData.paidBy,
        changes: splitData.changes,
      })
    })

    return result
  }
)
