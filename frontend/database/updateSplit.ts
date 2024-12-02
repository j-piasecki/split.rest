import { makeRequest } from './makeRequest'
import { BalanceChange, SplitWithChanges, UpdateSplitArguments } from 'shared'

export async function updateSplit(
  splitId: number,
  groupId: number,
  paidBy: string,
  title: string,
  total: number,
  timestamp: number,
  balances: BalanceChange[]
): Promise<SplitWithChanges> {
  const args: UpdateSplitArguments = { splitId, groupId, title, total, balances, paidBy, timestamp }
  const result = await makeRequest<UpdateSplitArguments, SplitWithChanges>(
    'POST',
    'updateSplit',
    args
  )

  if (!result) {
    throw new Error('Failed to update split')
  }

  return result
}
