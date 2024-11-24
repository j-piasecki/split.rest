import { auth, db } from '@utils/firebase'
import { doc, getDoc } from 'firebase/firestore'

export async function getGroupBalance(id: string) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get the balance')
  }

  const groupUserData = (await getDoc(doc(db, 'groups', id, 'users', auth.currentUser.uid))).data()

  if (groupUserData) {
    return groupUserData.balance
  } else {
    console.error(`Group with id ${id} or user not found`)
  }

  return null
}
