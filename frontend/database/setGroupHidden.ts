import { auth, functions } from '@utils/firebase'
import { httpsCallable } from 'firebase/functions'
import { SetGroupHiddenArguments } from 'shared'

const remoteSetGroupHidden = httpsCallable(functions, 'setGroupHidden')

export async function setGroupHidden(groupId: string, hidden: boolean): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to change group visibility')
  }

  const args: SetGroupHiddenArguments = { groupId, hidden }

  return remoteSetGroupHidden(args).then(() => void 0)
}
