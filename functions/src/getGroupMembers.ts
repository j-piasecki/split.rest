import * as admin from 'firebase-admin'
import { HttpsError, onCall } from 'firebase-functions/https'
import { GetGroupMembersArguments, Member } from 'shared'

export const getGroupMembers = onCall(
  {
    region: 'europe-west1',
    cors: true,
    enforceAppCheck: true,
  },
  async (request): Promise<Member[]> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')
    }

    const data = request.data as Partial<GetGroupMembersArguments> | null

    if (!data || !data.groupId) {
      throw new HttpsError('invalid-argument', 'Invalid arguments')
    }

    const groupId = data.groupId
    const startAfter = data.startAfter

    const db = admin.firestore()

    let query = db
      .collection('groups')
      .doc(groupId)
      .collection('users')
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(10)

    if (startAfter) {
      query = query.startAfter(startAfter)
    }

    const membersData = await query.get()
    const partialMembers: Partial<Member>[] = []

    membersData.forEach((member) => {
      const memberData = member.data()
      partialMembers.push({
        id: member.id,
        balance: memberData.balance,
        isAdmin: memberData.admin,
        hasAccess: memberData.access,
      })
    })

    const result = (
      await Promise.all(
        partialMembers.map(async (member): Promise<Member | undefined> => {
          const user = await db.collection('users').doc(member.id!).get()
          const userData = user.data()

          if (!userData) {
            return
          }

          return {
            id: member.id!,
            name: userData.name,
            email: userData.email,
            photoURL: userData.photoURL,
            balance: member.balance!,
            isAdmin: member.isAdmin!,
            hasAccess: member.hasAccess!,
          }
        })
      )
    )

    const filtered = result.filter((member) => member !== undefined) as Member[]

    return filtered
  }
)
