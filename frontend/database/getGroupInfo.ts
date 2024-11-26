import { auth, db } from '@utils/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { GroupInfoWithBalance } from 'shared'

// TODO: rules

export async function getGroupInfo(id: string): Promise<GroupInfoWithBalance | null> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get group info')
  }

  const groupData = (await getDoc(doc(db, 'groups', id))).data()
  const groupUserData = (await getDoc(doc(db, 'groups', id, 'users', auth.currentUser.uid))).data()

  if (groupData && groupUserData) {
    return {
      id: id,
      name: groupData.name,
      currency: groupData.currency,
      hidden: groupUserData.hidden,
      isAdmin: groupUserData.admin,
      memberCount: groupData.memberCount,
      hasAccess: groupUserData.access,
      balance: groupUserData.balance,
    }
  } else {
    console.error(`Group with id ${id} not found`)
  }

  return null
}