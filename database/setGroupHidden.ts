import { auth, db } from '@utils/firebase'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'

export async function setGroupHidden(groupId: string, hidden: boolean): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to change group visibility')
  }

  await updateDoc(doc(db, 'groups', groupId, 'users', auth.currentUser.uid), {
    hidden: hidden,
  })

  await updateDoc(doc(db, 'users', auth.currentUser.uid, 'data', 'groups'), {
    hidden: hidden ? arrayUnion(groupId) : arrayRemove(groupId),
  })
}
