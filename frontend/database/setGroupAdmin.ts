import { auth, functions } from '@utils/firebase'
import { httpsCallable } from 'firebase/functions'
import { SetGroupAdminArguments } from 'shared'

const remoteSetGroupAdmin = httpsCallable(functions, 'setGroupAdmin')

export async function setGroupAdmin(
  groupId: string,
  userId: string,
  admin: boolean
): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to change admin rights')
  }

  const args: SetGroupAdminArguments = { groupId, userId, admin }

  return remoteSetGroupAdmin(args).then(() => void 0)
}
