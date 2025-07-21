import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateSplitRelatedQueries } from '@utils/queryClient'
import { ResolveDelayedSplitArguments } from 'shared'

export async function resolveSplit(args: ResolveDelayedSplitArguments) {
  await makeRequest<ResolveDelayedSplitArguments, number>('POST', 'resolveDelayedSplit', args)
  await invalidateSplitRelatedQueries(args.groupId, args.splitId)
}

export function useResolveSplit() {
  return useMutation({
    mutationFn: (args: ResolveDelayedSplitArguments) => resolveSplit(args),
  })
}
