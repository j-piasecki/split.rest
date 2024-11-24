import { auth, db } from '@utils/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

export async function findUserIdByEmail(email: string): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to add query users')
  }

  const user = await getDocs(query(collection(db, 'users'), where('email', '==', email)))

  if (user.empty) {
    throw new Error(`User with email ${email} not found`)
  }

  return user.docs[0].id
}
