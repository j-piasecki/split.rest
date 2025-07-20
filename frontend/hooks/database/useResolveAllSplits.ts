import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroup } from '@utils/queryClient'
import { DelayedSplitResolutionMethod, ResolveAllDelayedSplitsAtOnceArguments } from 'shared'

async function resolveAllDelayedSplits(
  groupId: number,
  resolutionMethod: DelayedSplitResolutionMethod
) {
  const args: ResolveAllDelayedSplitsAtOnceArguments = { groupId, resolutionMethod }

  await makeRequest('POST', 'resolveAllDelayedSplitsAtOnce', args)

  await invalidateGroup(groupId)
}

export function useResolveAllDelayedSplits(groupId: number) {
  return useMutation({
    mutationFn: (resolutionMethod: DelayedSplitResolutionMethod) =>
      resolveAllDelayedSplits(groupId, resolutionMethod),
  })
}
