import { makeRequest } from '../utils/makeApiRequest'
import { DeleteGroupArguments } from 'shared'

export async function deleteGroup(groupId: number) {
  const args: DeleteGroupArguments = { groupId }

  return await makeRequest('DELETE', 'deleteGroup', args)
}
