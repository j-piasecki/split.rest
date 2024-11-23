import { GroupInfo } from "@type/group"
import { db, auth } from "@utils/firebase"
import { getDoc, doc } from "firebase/firestore"

export async function getGroupInfo(id: string): Promise<GroupInfo | null> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get all groups')
  }

    const groupDoc = await getDoc(doc(db, 'groups', id))
    const groupMeta = await getDoc(doc(db, 'users', auth.currentUser.uid, 'groups', id))

    const data = groupDoc.data()
    const metaData = groupMeta.data()

    if (data && metaData) {
      return {
        id: id,
        name: data.name,
        currency: data.currency,
        hidden: metaData.hidden,
        admin: metaData.admin,
        memberCount: data.members,
      }
    } else {
      console.error(`Group with id ${id} not found`)
    }

  return null
}