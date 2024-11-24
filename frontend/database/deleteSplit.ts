import { auth, functions } from '@utils/firebase'
import { httpsCallable } from 'firebase/functions'
import { DeleteSplitArguments } from 'shared'

const remoteDeleteSplit = httpsCallable(functions, 'deleteSplit')

export async function deleteSplit(groupId: string, splitId: string) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to delete a split')
  }

  const args: DeleteSplitArguments = { groupId, splitId }

  return remoteDeleteSplit(args).then(() => void 0)
}
