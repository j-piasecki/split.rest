import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateSplitRelatedQueries, updateCachedSplit } from '@utils/queryClient'
import { UpdateSplitArguments } from 'shared'

async function updateSplit(queryClient: QueryClient, args: UpdateSplitArguments) {
  await makeRequest<UpdateSplitArguments, void>('POST', 'updateSplit', args)

  await updateCachedSplit(args.groupId, args.splitId, (split) => ({
    ...split,
    ...args,
    total: String(args.total),
    version: split.version + 1,
  }))
  await invalidateSplitRelatedQueries(args.groupId, args.splitId)
}

export function useUpdateSplit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: UpdateSplitArguments) => updateSplit(queryClient, args),
  })
}
