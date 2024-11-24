import { auth, functions } from '@utils/firebase'
import { httpsCallable } from 'firebase/functions'
import { BalanceChange, CreateSplitArguments, Split } from 'shared'

const remoteCreateSplit = httpsCallable(functions, 'createSplit')

export async function createSplit(
  groupId: string,
  title: string,
  total: number,
  balances: BalanceChange[]
): Promise<Split> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to verify users')
  }

  const args: CreateSplitArguments = { groupId, title, total, balances }

  return remoteCreateSplit(args).then((result) => {
    const split = result.data as Split

    return split
  })
}
