import { makeRequest } from '../utils/makeApiRequest'
import { auth } from '@utils/firebase'
import { User } from 'shared'

export async function createOrUpdateUser() {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to update user data')
  }

  const user: User = {
    id: auth.currentUser.uid,
    name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Anonymous',
    email: auth.currentUser.email!,
    photoUrl: auth.currentUser.photoURL ?? undefined,
  }

  return await makeRequest('POST', 'createOrUpdateUser', user as unknown as Record<string, string>)
}
