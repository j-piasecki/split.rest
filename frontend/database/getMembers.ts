import { makeRequest } from './makeRequest'
import { GetGroupMembersArguments, Member } from 'shared'

export async function getMembers(groupId: number, startAfter?: string): Promise<Member[]> {
  const args: GetGroupMembersArguments = { groupId, startAfter }

  return (await makeRequest('GET', 'getGroupMembers', args)) ?? []
}
