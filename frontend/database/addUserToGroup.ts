import { makeRequest } from './makeRequest'
import { AddUserToGroupArguments } from 'shared'

export async function addUserToGroup(groupId: number, userId: string): Promise<void> {
  const args: AddUserToGroupArguments = { groupId, userId }

  await makeRequest('POST', 'addUserToGroup', args)
}
