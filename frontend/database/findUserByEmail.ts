import { auth, db } from '@utils/firebase'
import { doc, getDoc } from 'firebase/firestore'

// TODO: needs a rule to prevent entire collection read

export async function findUserIdByEmail(email: string): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to add query users')
  }

  const data = (await getDoc(doc(db, 'email2uid', email))).data()

  if (!data) {
    throw new Error(`User with email ${email} not found`)
  }

  return data.uid
}
