import { auth, functions } from '@utils/firebase'
import { httpsCallable } from 'firebase/functions'
import { SetGroupAccessArguments } from 'shared'

const remoteSetGroupAccess = httpsCallable(functions, 'setGroupAccess')

export async function setGroupAccess(
  groupId: string,
  userId: string,
  access: boolean
): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to change group access')
  }

  const args: SetGroupAccessArguments = { groupId, userId, access }

  return remoteSetGroupAccess(args).then(() => void 0)
}
