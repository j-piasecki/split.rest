import { makeRequest } from './makeRequest'
import { GetGroupMembersAutocompletionsArguments, User } from 'shared'

export async function getGroupMemberAutocompletions(
  groupId: number,
  query: string
): Promise<User[]> {
  const args: GetGroupMembersAutocompletionsArguments = { groupId, query }

  return (await makeRequest('GET', 'getGroupMemberAutocompletions', args))!
}
