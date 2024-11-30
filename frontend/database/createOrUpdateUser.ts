import { makeRequest } from './makeRequest'
import { auth } from '@utils/firebase'
import { User } from 'shared'

export async function createOrUpdateUser() {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to update user data')
  }

  const user: User = {
    id: auth.currentUser.uid,
    name: auth.currentUser.displayName!,
    email: auth.currentUser.email!,
    photoURL: auth.currentUser.photoURL!,
  }

  return await makeRequest('POST', 'createOrUpdateUser', user as unknown as Record<string, string>)
}
