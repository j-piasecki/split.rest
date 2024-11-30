import { makeRequest } from './makeRequest'
import { RestoreSplitArguments, Split } from 'shared'

export async function restoreSplit(splitId: number, groupId: number): Promise<void> {
  const args: RestoreSplitArguments = { splitId, groupId }

  await makeRequest<RestoreSplitArguments, Split>('POST', 'restoreSplit', args)
}
