import { AddUserToGroupArguments } from 'shared'
import { makeRequest } from './makeRequest'

export async function addUserToGroup(groupId: number, userId: string): Promise<void> {
  const args: AddUserToGroupArguments = { groupId, userId }

  await makeRequest('POST', 'addUserToGroup', args)
}
