import { makeRequest } from '../utils/makeApiRequest'
import { AddUserToGroupArguments } from 'shared'

export async function addUserToGroup(groupId: number, userId: string): Promise<void> {
  const args: AddUserToGroupArguments = { groupId, userId }

  await makeRequest('POST', 'addUserToGroup', args)
}
