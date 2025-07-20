import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateSplitRelatedQueries } from '@utils/queryClient'
import { UpdateSplitArguments } from 'shared'

export async function resolveSplit(args: UpdateSplitArguments) {
  await makeRequest<UpdateSplitArguments, number>('POST', 'resolveDelayedSplit', args)
  await invalidateSplitRelatedQueries(args.groupId, args.splitId)
}

export function useResolveSplit() {
  return useMutation({
    mutationFn: (args: UpdateSplitArguments) => resolveSplit(args),
  })
}
