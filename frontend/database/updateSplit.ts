import { auth, functions } from '@utils/firebase'
import { httpsCallable } from 'firebase/functions'
import { BalanceChange, UpdateSplitArguments, Split } from 'shared'

const remoteUpdateSplit = httpsCallable(functions, 'updateSplit')

export async function updateSplit(
  splitId: string,
  groupId: string,
  title: string,
  total: number,
  balances: BalanceChange[]
): Promise<Split> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to verify users')
  }

  const args: UpdateSplitArguments = { splitId, groupId, title, total, balances }

  return remoteUpdateSplit(args).then((result) => {
    const split = result.data as Split

    return split
  })
}
