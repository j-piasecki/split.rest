import { makeRequest } from '../utils/makeApiRequest'
import { auth } from '@utils/firebase'
import { TranslatableError } from 'shared'

export async function deleteUser() {
  if (!auth.currentUser) {
    throw new TranslatableError('api.mustBeLoggedIn')
  }

  return await makeRequest('POST', 'deleteUser', {})
}
