import { makeRequest } from './makeRequest'
import { GetGroupInfoArguments, GroupInfo } from 'shared'

export async function getGroupInfo(id: number): Promise<GroupInfo | null> {
  const args: GetGroupInfoArguments = { groupId: id }

  return await makeRequest('GET', 'getGroupInfo', args)
}
