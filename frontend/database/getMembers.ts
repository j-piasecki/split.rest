import { makeRequest } from './makeRequest'
import { GetGroupMembersArguments, Member } from 'shared'

export async function getMembers(groupId: number, startAfter?: string): Promise<Member[]> {
  const args: GetGroupMembersArguments = { groupId, startAfter }

  try {
    return (await makeRequest('GET', 'getGroupMembers', args)) ?? []
  } catch (e) {
    console.error(e)
    return []
  }
}
