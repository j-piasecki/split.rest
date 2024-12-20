import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { deleteCachedSplit, invalidateSplitRelatedQueries } from '@utils/queryClient'
import { DeleteSplitArguments } from 'shared'

async function deleteSplit(groupId: number, splitId: number) {
  const args: DeleteSplitArguments = { groupId, splitId }

  await makeRequest('DELETE', 'deleteSplit', args)

  await deleteCachedSplit(args.groupId, args.splitId)
  await invalidateSplitRelatedQueries(args.groupId, args.splitId)
}

export function useDeleteSplit(groupId: number) {
  return useMutation({
    mutationFn: (splitId: number) => deleteSplit(groupId, splitId),
  })
}
