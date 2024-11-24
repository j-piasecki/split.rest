import { auth, db } from '@utils/firebase'
import { collection, doc, getDoc, getDocs, limit, query } from 'firebase/firestore'
import { Member } from 'shared'

// TODO: function and pagination

export async function getMembers(groupId: string): Promise<Member[]> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get all groups')
  }

  const groupMembers = await getDocs(query(collection(db, 'groups', groupId, 'users'), limit(10)))

  const data: Partial<Member>[] = []

  groupMembers.forEach(async (member) => {
    const memberData = member.data()
    data.push({
      id: member.id,
      balance: memberData.balance,
      isAdmin: memberData.admin,
      hasAccess: memberData.access,
    })
  })

  const result: Member[] = []

  for (const member of data) {
    const user = await getDoc(doc(db, 'users', member.id!))
    const userData = user.data()

    if (userData) {
      result.push({
        id: member.id!,
        name: userData.name,
        email: userData.email,
        photoURL: userData.photoURL,
        balance: member.balance!,
        isAdmin: member.isAdmin!,
        hasAccess: member.hasAccess!,
      })
    }
  }

  return result
}
