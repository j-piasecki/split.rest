import { makeRequest } from '../utils/makeApiRequest'
import { auth } from '@utils/firebase'
import { invalidateUserById } from '@utils/queryClient'
import { CreateOrUpdateUserArguments, TranslatableError } from 'shared'

export async function createOrUpdateUser() {
  if (!auth.currentUser) {
    throw new TranslatableError('api.mustBeLoggedIn')
  }

  const user: CreateOrUpdateUserArguments = {
    id: auth.currentUser.uid,
    name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Anonymous',
    email: auth.currentUser.email!,
    photoUrl: auth.currentUser.photoURL,
    deleted: false,
    pictureId: null,
  }

  await makeRequest<CreateOrUpdateUserArguments, void>('POST', 'createOrUpdateUser', user)
  await invalidateUserById(auth.currentUser.uid)
}
