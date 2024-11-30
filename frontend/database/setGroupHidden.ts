import { makeRequest } from './makeRequest'
import { SetGroupHiddenArguments } from 'shared'

export async function setGroupHidden(groupId: number, hidden: boolean): Promise<void> {
  const args: SetGroupHiddenArguments = { groupId, hidden }

  await makeRequest('POST', 'setGroupHidden', args)
}
