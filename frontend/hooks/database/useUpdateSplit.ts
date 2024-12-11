import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { SplitInfo, UpdateSplitArguments } from 'shared'

async function updateSplit(queryClient: QueryClient, args: UpdateSplitArguments) {
  await makeRequest<UpdateSplitArguments, void>('POST', 'updateSplit', args)

  await queryClient.setQueryData(['groupSplits', args.groupId], (oldData?: { pages: SplitInfo[][] }) => {
    if (!oldData) {
      return
    }

    return {
      ...oldData,
      pages: oldData.pages.map((page) =>
        page.map((split) =>
          split.id === args.splitId ? { ...split, ...args, version: split.version + 1 } : split
        )
      ),
    }
  })

  await queryClient.invalidateQueries({ queryKey: ['groupSplits', args.groupId] })
  await queryClient.invalidateQueries({ queryKey: ['groupInfo', args.groupId] })
}

export function useUpdateSplit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: UpdateSplitArguments) => updateSplit(queryClient, args),
  })
}
