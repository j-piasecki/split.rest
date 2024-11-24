import { auth, functions } from '@utils/firebase'
import { httpsCallable } from 'firebase/functions'
import { GetGroupMembersArguments, Member } from 'shared'

const remoteGetMembers = httpsCallable(functions, 'getGroupMembers')

export async function getMembers(groupId: string, startAfter?: string): Promise<Member[]> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get all groups')
  }

  const args: GetGroupMembersArguments = { groupId, startAfter }

  return await remoteGetMembers(args).then((result) => result.data as Member[])
}
