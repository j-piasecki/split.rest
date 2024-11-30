import { DeleteSplitArguments } from 'shared'
import { makeRequest } from './makeRequest'


export async function deleteSplit(groupId: number, splitId: number) {
  const args: DeleteSplitArguments = { groupId, splitId }

  return await makeRequest('POST', 'deleteSplit', args)
}
