import { makeRequest } from './makeRequest'
import { DeleteGroupArguments } from 'shared'

export async function deleteGroup(groupId: number) {
  const args: DeleteGroupArguments = { groupId }

  return await makeRequest('POST', 'deleteGroup', args)
}
