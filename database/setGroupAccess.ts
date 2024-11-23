import { db, auth } from "@utils/firebase"
import { getDoc, doc, updateDoc } from "firebase/firestore"

export async function setGroupAccess(groupId: string, userId: string, access: boolean): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to change group access')
  }

  const groupUserData = (await getDoc(doc(db, 'groups', groupId, 'users', auth.currentUser.uid))).data()

  if (!groupUserData?.admin) {
    throw new Error('You do not have permission to change group access')
  }

  const change: Record<string, any> = {
    access: access
  }

  if (!access) {
    // If access is being removed, remove admin status as well
    change.admin = false
  }

  await updateDoc(doc(db, 'groups', groupId, 'users', userId), change)
}