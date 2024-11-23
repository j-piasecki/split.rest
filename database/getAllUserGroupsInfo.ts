import { GroupInfo, GroupMetadata } from '@type/group'
import { auth, db } from '@utils/firebase'
import { doc, getDoc } from 'firebase/firestore'

export async function getAllUserGroupsInfo(metadata: GroupMetadata[]) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get all groups')
  }

  const result: GroupInfo[] = []

  for (const group of metadata) {
    const groupDoc = await getDoc(doc(db, 'groups', group.id))
    const data = groupDoc.data()

    if (data) {
      result.push({
        id: group.id,
        name: data.name,
        currency: data.currency,
        hidden: group.hidden,
        memberCount: data.memberCount,
        isAdmin: data.admin,
        hasAccess: data.access,
      })
    } else {
      console.error(`Group with id ${group.id} not found`)
    }
  }

  return result
}
