import { auth, functions } from '@utils/firebase'
import { httpsCallable } from 'firebase/functions'
import { CreateGroupArguments, GroupInfo } from 'shared'

const remoteCreateGroup = httpsCallable(functions, 'createGroup')

export async function createGroup(name: string, currency: string): Promise<GroupInfo> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to create a group')
  }

  const args: CreateGroupArguments = { name, currency }

  return remoteCreateGroup(args).then((result) => {
    const groupInfo = result.data as GroupInfo

    return groupInfo
  })
}
