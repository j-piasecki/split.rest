import { makeRequest } from '../utils/makeApiRequest'
import { GetGroupMembersAutocompletionsArguments, Member } from 'shared'

export async function getGroupMemberAutocompletions(
  groupId: number,
  query: string
): Promise<Member[]> {
  const args: GetGroupMembersAutocompletionsArguments = { groupId, query }

  return (await makeRequest('GET', 'getGroupMemberAutocompletions', args))!
}
