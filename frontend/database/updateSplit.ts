import { BalanceChange, Split, UpdateSplitArguments } from 'shared'
import { makeRequest } from './makeRequest'

export async function updateSplit(
  splitId: number,
  groupId: number,
  title: string,
  total: number,
  balances: BalanceChange[]
): Promise<Split> {
  const args: UpdateSplitArguments = { splitId, groupId, title, total, balances }
  const result = await makeRequest<UpdateSplitArguments, Split>('POST', 'updateSplit', args)

  if (!result) {
    throw new Error('Failed to update split')
  }

  return result
}
