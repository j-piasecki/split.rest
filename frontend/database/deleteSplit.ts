import { auth, db } from '@utils/firebase'
import { deleteDoc, doc, getDoc, increment, updateDoc } from 'firebase/firestore'

export async function deleteSplit(groupId: string, splitId: string) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to delete a split')
  }

  const splitData = (await getDoc(doc(db, 'groups', groupId, 'entries', splitId))).data()

  if (!splitData) {
    throw new Error('Split not found')
  }

  if (splitData.paidBy !== auth.currentUser.uid) {
    const groupUserData = (
      await getDoc(doc(db, 'groups', groupId, 'users', auth.currentUser.uid))
    ).data()

    if (!groupUserData?.admin) {
      throw new Error('You do not have permission to delete this split')
    }
  }

  for (const { id, change } of splitData.changes) {
    await updateDoc(doc(db, 'groups', groupId, 'users', id), {
      balance: increment(-change),
    })
  }

  await deleteDoc(doc(db, 'groups', groupId, 'entries', splitId))
}
