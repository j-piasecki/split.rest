import * as admin from 'firebase-admin'
import { HttpsError, onCall } from 'firebase-functions/https'
import { AddUserToGroupArguments } from 'shared'

export const addUserToGroup = onCall(
  {
    region: 'europe-west1',
    cors: true,
    enforceAppCheck: true,
  },
  async (request): Promise<void> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')
    }

    const data = request.data as Partial<AddUserToGroupArguments> | null

    if (!data || !data.groupId || !data.userId) {
      throw new HttpsError('invalid-argument', 'Invalid arguments')
    }

    const uid = request.auth.uid
    const groupId = data.groupId
    const userId = data.userId

    const db = admin.firestore()

    return db.runTransaction(async (transaction) => {
      const groupData = (await transaction.get(db.collection('groups').doc(groupId))).data()

      if (!groupData) {
        throw new HttpsError('not-found', 'Group not found')
      }

      const groupUserData = (
        await transaction.get(db.collection('groups').doc(groupId).collection('users').doc(uid))
      ).data()

      if (!groupUserData?.admin) {
        throw new HttpsError(
          'permission-denied',
          'You do not have permission to add users to this group'
        )
      }

      const userExists = (await transaction.get(db.collection('users').doc(userId))).exists

      if (!userExists) {
        throw new HttpsError('not-found', 'User not found')
      }

      const userAlreadyAMember = (
        await transaction.get(db.collection('groups').doc(groupId).collection('users').doc(userId))
      ).exists

      if (userAlreadyAMember) {
        throw new HttpsError('already-exists', 'User is already a member of the group')
      }

      transaction.set(db.collection('groups').doc(groupId).collection('users').doc(userId), {
        balance: 0,
        admin: false,
        access: true,
        hidden: false,
      })

      transaction.update(db.collection('users').doc(userId).collection('data').doc('groups'), {
        groups: admin.firestore.FieldValue.arrayUnion(groupId),
      })
    })
  }
)
