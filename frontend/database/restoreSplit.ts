import { makeRequest } from '../utils/makeApiRequest'
import { RestoreSplitArguments, SplitWithChanges } from 'shared'

// TODO: mutation I guess
export async function restoreSplit(splitId: number, groupId: number): Promise<void> {
  const args: RestoreSplitArguments = { splitId, groupId }

  await makeRequest<RestoreSplitArguments, SplitWithChanges>('POST', 'restoreSplit', args)
}
