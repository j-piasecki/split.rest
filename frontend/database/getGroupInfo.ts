import { GetGroupInfoArguments, GroupInfo } from 'shared'
import { makeRequest } from './makeRequest'

export async function getGroupInfo(id: number): Promise<GroupInfo | null> {
  const args: GetGroupInfoArguments = { groupId: id }

  return await makeRequest('GET', 'getGroupInfo', args)
}
