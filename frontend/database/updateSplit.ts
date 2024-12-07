import { makeRequest } from '../utils/makeApiRequest'
import { BalanceChange, UpdateSplitArguments } from 'shared'

export async function updateSplit(
  splitId: number,
  groupId: number,
  paidBy: string,
  title: string,
  total: number,
  timestamp: number,
  balances: BalanceChange[]
): Promise<void> {
  const args: UpdateSplitArguments = { splitId, groupId, title, total, balances, paidBy, timestamp }
  await makeRequest<UpdateSplitArguments, void>('POST', 'updateSplit', args)
}
