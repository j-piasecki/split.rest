import { SetGroupAccessArguments } from 'shared'
import { makeRequest } from './makeRequest'

export async function setGroupAccess(
  groupId: number,
  userId: string,
  access: boolean
): Promise<void> {
  const args: SetGroupAccessArguments = { groupId, userId, access }

  await makeRequest('POST', 'setGroupAccess', args)
}
