import { makeRequest } from './makeRequest'
import { DeleteSplitArguments } from 'shared'

export async function deleteSplit(groupId: number, splitId: number) {
  const args: DeleteSplitArguments = { groupId, splitId }

  return await makeRequest('DELETE', 'deleteSplit', args)
}
