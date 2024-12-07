import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { SplitInfo, UpdateSplitArguments } from 'shared'

async function updateSplit(queryClient: QueryClient, args: UpdateSplitArguments) {
  await makeRequest<UpdateSplitArguments, void>('POST', 'updateSplit', args)

  queryClient.setQueryData(['groupSplits', args.groupId], (oldData: { pages: SplitInfo[][] }) => {
    return {
      ...oldData,
      pages: oldData.pages.map((page) =>
        page.map((split) => (split.id === args.splitId ? { ...split, ...args } : split))
      ),
    }
  })

  queryClient.invalidateQueries({ queryKey: ['groupSplits', args.groupId] })
  queryClient.invalidateQueries({ queryKey: ['groupInfo', args.groupId] })
}

export function useUpdateSplit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: UpdateSplitArguments) => updateSplit(queryClient, args),
  })
}
