import { db, auth } from "@utils/firebase"
import { getDoc, doc } from "firebase/firestore"

export async function getGroupBalance(id: string) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get the balance')
  }

    const groupUserDoc = await getDoc(doc(db, 'groups', id, 'users', auth.currentUser.uid))

    const data = groupUserDoc.data()

    if (data) {
      return data.balance
    } else {
      console.error(`Group with id ${id} or user not found`)
    }

  return null
}