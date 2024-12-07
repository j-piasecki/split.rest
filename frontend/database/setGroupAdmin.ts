import { makeRequest } from '../utils/makeApiRequest'
import { SetGroupAdminArguments } from 'shared'

export async function setGroupAdmin(
  groupId: number,
  userId: string,
  admin: boolean
): Promise<void> {
  const args: SetGroupAdminArguments = { groupId, userId, admin }

  await makeRequest('POST', 'setGroupAdmin', args)
}
