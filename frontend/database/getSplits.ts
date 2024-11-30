import { GetGroupSplitsArguments, SplitInfo } from 'shared'
import { makeRequest } from './makeRequest'

export async function getSplits(groupId: number, startAfterTimestamp?: number): Promise<SplitInfo[]> {
  const args: GetGroupSplitsArguments = { groupId, startAfterTimestamp }

  return await makeRequest('GET', 'getGroupSplits', args) ?? []
}
