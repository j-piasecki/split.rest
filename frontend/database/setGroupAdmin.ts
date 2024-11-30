import { SetGroupAdminArguments } from 'shared'
import { makeRequest } from './makeRequest'

export async function setGroupAdmin(
  groupId: number,
  userId: string,
  admin: boolean
): Promise<void> {
  const args: SetGroupAdminArguments = { groupId, userId, admin }

  await makeRequest('POST', 'setGroupAdmin', args)
}
