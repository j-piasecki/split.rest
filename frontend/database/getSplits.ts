import { auth, functions } from '@utils/firebase'
import { httpsCallable } from 'firebase/functions'
import { GetGroupSplitsArguments, Split } from 'shared'

const remoteGetSplits = httpsCallable(functions, 'getGroupSplits')

export async function getSplits(groupId: string, startAfterTimestamp?: number): Promise<Split[]> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get the entries')
  }

  const args: GetGroupSplitsArguments = { groupId, startAfterTimestamp }

  return await remoteGetSplits(args).then((result) => result.data as Split[])
}
