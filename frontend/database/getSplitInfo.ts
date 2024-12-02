import { makeRequest } from './makeRequest'
import { GetSplitInfoArguments, SplitWithUsers } from 'shared'

export async function getSplitInfo(
  groupId: number,
  splitId: number
): Promise<SplitWithUsers | null> {
  const args: GetSplitInfoArguments = { groupId: groupId, splitId: splitId }

  return await makeRequest('GET', 'getSplitInfo', args)
}
