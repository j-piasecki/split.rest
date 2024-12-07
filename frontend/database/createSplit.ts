import { makeRequest } from '../utils/makeApiRequest'
import { BalanceChange, CreateSplitArguments } from 'shared'

export async function createSplit(
  groupId: number,
  paidBy: string,
  title: string,
  total: number,
  timestamp: number,
  balances: BalanceChange[]
): Promise<number> {
  const args: CreateSplitArguments = { groupId, title, total, balances, paidBy, timestamp }
  const result = await makeRequest<CreateSplitArguments, number>('POST', 'createSplit', args)

  if (!result) {
    throw new Error('Failed to create split')
  }

  return result
}
