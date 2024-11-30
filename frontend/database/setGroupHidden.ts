import { SetGroupHiddenArguments } from 'shared'
import { makeRequest } from './makeRequest'

export async function setGroupHidden(groupId: number, hidden: boolean): Promise<void> {
  const args: SetGroupHiddenArguments = { groupId, hidden }

  await makeRequest('POST', 'setGroupHidden', args)
}
