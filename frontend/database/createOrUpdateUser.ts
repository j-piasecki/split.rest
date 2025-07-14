import { makeRequest } from '../utils/makeApiRequest'
import { auth } from '@utils/firebase'
import { TranslatableError, User } from 'shared'

export async function createOrUpdateUser() {
  if (!auth.currentUser) {
    throw new TranslatableError('api.mustBeLoggedIn')
  }

  const user: User = {
    id: auth.currentUser.uid,
    name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Anonymous',
    email: auth.currentUser.email!,
    photoUrl: auth.currentUser.photoURL,
    deleted: false,
  }

  await makeRequest('POST', 'createOrUpdateUser', user as unknown as Record<string, string>)
}
