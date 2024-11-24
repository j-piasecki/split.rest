import * as admin from 'firebase-admin'
import { HttpsError, onCall } from 'firebase-functions/https'
import { SetGroupAccessArguments } from 'shared'

export const setGroupAccess = onCall(
  {
    region: 'europe-west1',
    cors: true,
    enforceAppCheck: true,
  },
  async (request): Promise<void> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')
    }

    const data = request.data as Partial<SetGroupAccessArguments> | null

    if (!data || !data.groupId || !data.userId || data.access === undefined) {
      throw new HttpsError('invalid-argument', 'Invalid arguments')
    }

    const uid = request.auth.uid
    const groupId = data.groupId
    const userId = data.userId
    const access = data.access

    if (uid === userId) {
      throw new HttpsError('invalid-argument', 'You cannot change your own access')
    }

    const db = admin.firestore()

    const groupUserData = (
      await db.collection('groups').doc(groupId).collection('users').doc(uid).get()
    ).data()

    if (!groupUserData?.admin) {
      throw new HttpsError('permission-denied', 'You do not have permission to change group access')
    }

    const change: Record<string, boolean> = {
      access: access,
    }

    if (!access) {
      // If access is being removed, remove admin status as well
      change.admin = false
    }

    await db.collection('groups').doc(groupId).collection('users').doc(userId).update(change)
  }
)
