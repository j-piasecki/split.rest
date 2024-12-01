import { makeRequest } from './makeRequest'
import { GetGroupSplitsArguments, SplitInfo } from 'shared'

export async function getSplits(
  groupId: number,
  startAfterTimestamp?: number
): Promise<SplitInfo[]> {
  const args: GetGroupSplitsArguments = { groupId, startAfterTimestamp }

  try {
    return (await makeRequest('GET', 'getGroupSplits', args)) ?? []
  } catch (e) {
    console.error(e)
    return []
  }
}
