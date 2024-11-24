import { auth, functions } from '@utils/firebase'
import { httpsCallable } from 'firebase/functions'
import { AddUserToGroupArguments } from 'shared'

const remoteAddUserToGroup = httpsCallable(functions, 'addUserToGroup')

export async function addUserToGroup(groupId: string, userId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to add users to a group')
  }

  const args: AddUserToGroupArguments = { groupId, userId }

  return remoteAddUserToGroup(args).then(() => void 0)
}
