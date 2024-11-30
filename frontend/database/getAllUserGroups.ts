import { auth } from '@utils/firebase'
import { GetUserGroupsArguments, GroupInfo } from 'shared'
import { makeRequest } from './makeRequest'

export async function getAllUserGroups(hidden: boolean, startAfter?: number): Promise<GroupInfo[]> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get all groups')
  }

  const args: GetUserGroupsArguments = { hidden: hidden, startAfter: startAfter }

  return await makeRequest('GET', 'getUserGroups', args) ?? [];
}
