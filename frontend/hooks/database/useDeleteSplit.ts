import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { DeleteSplitArguments, SplitInfo } from 'shared'

async function deleteSplit(queryClient: QueryClient, groupId: number, splitId: number) {
  const args: DeleteSplitArguments = { groupId, splitId }

  await makeRequest('DELETE', 'deleteSplit', args)

  queryClient.removeQueries({ queryKey: ['groupSplits', args.groupId, splitId] })

  await queryClient.setQueryData(['groupSplits', groupId], (oldData?: { pages: SplitInfo[][] }) => {
    if (!oldData) {
      return
    }

    return {
      ...oldData,
      pages: oldData.pages.map((page) => page.filter((split) => split.id !== splitId)),
    }
  })

  await queryClient.invalidateQueries({ queryKey: ['groupSplits', groupId] })
  await queryClient.invalidateQueries({ queryKey: ['groupMembers', args.groupId] })
  await queryClient.invalidateQueries({ queryKey: ['groupInfo', groupId] })
}

export function useDeleteSplit(groupId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (splitId: number) => deleteSplit(queryClient, groupId, splitId),
  })
}
