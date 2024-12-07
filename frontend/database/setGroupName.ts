import { makeRequest } from './makeRequest'
import { SetGroupNameArguments } from 'shared'

export async function setGroupName(groupId: number, name: string): Promise<void> {
  const args: SetGroupNameArguments = { groupId, name }

  await makeRequest('POST', 'setGroupName', args)
}
