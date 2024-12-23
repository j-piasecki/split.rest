import { makeRequest } from '../utils/makeApiRequest'
import { invalidateSplitRelatedQueries } from '@utils/queryClient'
import { RestoreSplitArguments, SplitWithChanges } from 'shared'

// TODO: mutation I guess
export async function restoreSplit(splitId: number, groupId: number): Promise<void> {
  const args: RestoreSplitArguments = { splitId, groupId }

  await makeRequest<RestoreSplitArguments, SplitWithChanges>('POST', 'restoreSplit', args)

  await invalidateSplitRelatedQueries(groupId, splitId)
}
