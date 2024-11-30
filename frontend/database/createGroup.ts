import { makeRequest } from './makeRequest'
import { CreateGroupArguments, GroupInfo } from 'shared'

export async function createGroup(name: string, currency: string): Promise<GroupInfo> {
  const args: CreateGroupArguments = { name, currency }

  return (await makeRequest('POST', 'createGroup', args))!
}
