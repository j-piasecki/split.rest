import { makeRequest } from '../utils/makeApiRequest'
import { SetGroupAccessArguments } from 'shared'

export async function setGroupAccess(
  groupId: number,
  userId: string,
  access: boolean
): Promise<void> {
  const args: SetGroupAccessArguments = { groupId, userId, access }

  await makeRequest('POST', 'setGroupAccess', args)
}
