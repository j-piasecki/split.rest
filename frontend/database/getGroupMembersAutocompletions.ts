import { makeRequest } from '../utils/makeApiRequest'
import { GetGroupMembersAutocompletionsArguments, UserWithDisplayName } from 'shared'

export async function getGroupMemberAutocompletions(
  groupId: number,
  query: string
): Promise<UserWithDisplayName[]> {
  const args: GetGroupMembersAutocompletionsArguments = { groupId, query }

  return (await makeRequest('GET', 'getGroupMemberAutocompletions', args))!
}
