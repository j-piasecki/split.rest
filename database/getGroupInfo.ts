import { GroupInfo } from "@type/group"
import { db, auth } from "@utils/firebase"
import { getDoc, doc } from "firebase/firestore"

export async function getGroupInfo(id: string): Promise<GroupInfo | null> {
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
    }
  } else {
    console.error(`Group with id ${id} not found`)
  }

  return null
}