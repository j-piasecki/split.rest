import * as admin from 'firebase-admin'
import { HttpsError, onCall } from 'firebase-functions/https'
import { SetGroupAdminArguments } from 'shared'

export const setGroupAdmin = onCall(
  {
    region: 'europe-west1',
    cors: true,
    enforceAppCheck: true,
  },
  async (request): Promise<void> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')
    }

    const data = request.data as Partial<SetGroupAdminArguments> | null

    if (!data || !data.groupId || !data.userId || data.admin === undefined) {
      throw new HttpsError('invalid-argument', 'Invalid arguments')
    }

    const uid = request.auth.uid
    const groupId = data.groupId
    const userId = data.userId
    const isAdmin = data.admin

    if (uid === userId) {
      throw new HttpsError('invalid-argument', 'You cannot change your own admin status')
    }

    const db = admin.firestore()

    const groupUserData = (
      await db.collection('groups').doc(groupId).collection('users').doc(uid).get()
    ).data()

    if (!groupUserData?.admin) {
      throw new HttpsError('permission-denied', 'You do not have permission to change group access')
    }

    if (isAdmin) {
      const targetUserData = (
        await db.collection('groups').doc(groupId).collection('users').doc(userId).get()
      ).data()

      if (!targetUserData || !targetUserData.access) {
        throw new HttpsError('permission-denied', 'User does not have access to the group')
      }
    }

    await db.collection('groups').doc(groupId).collection('users').doc(userId).update({
      admin: isAdmin,
    })
  }
)
