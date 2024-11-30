import { CreateGroupArguments, GroupInfo } from 'shared'
import { makeRequest } from './makeRequest'

export async function createGroup(name: string, currency: string): Promise<GroupInfo> {
  const args: CreateGroupArguments = { name, currency }

  return (await makeRequest('POST', 'createGroup', args))!
}
