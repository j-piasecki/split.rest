import { db, auth } from "@utils/firebase"
import { getDoc, doc, updateDoc } from "firebase/firestore"

export async function setGroupAdmin(groupId: string, userId: string, admin: boolean): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to change admin rights')
  }

  const groupUserData = (await getDoc(doc(db, 'groups', groupId, 'users', auth.currentUser.uid))).data()

  if (!groupUserData?.admin) {
    throw new Error('You do not have permission to change admin rights')
  }

  if (admin) {
    const targetUserData = (await getDoc(doc(db, 'groups', groupId, 'users', userId))).data()

    if (!targetUserData || !targetUserData.access) {
      throw new Error('User does not have access to the group')
    }
  }

  await updateDoc(doc(db, 'groups', groupId, 'users', userId), {
    admin: admin
  })
}