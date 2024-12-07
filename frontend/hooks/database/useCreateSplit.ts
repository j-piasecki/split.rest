import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { CreateSplitArguments, SplitInfo } from 'shared'

async function createSplit(queryClient: QueryClient, args: CreateSplitArguments) {
  const splitId = await makeRequest<CreateSplitArguments, number>('POST', 'createSplit', args)

  queryClient.setQueryData(['groupSplits', args.groupId], (oldData: { pages: SplitInfo[][] }) => {
    return {
      ...oldData,
      pages: oldData.pages.map((page, index) =>
        index === 0 ? [...page, { id: splitId, ...args }] : page
      ),
    }
  })

  queryClient.invalidateQueries({ queryKey: ['groupSplits', args.groupId] })
  queryClient.invalidateQueries({ queryKey: ['groupInfo', args.groupId] })
}

export function useCreateSplit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: CreateSplitArguments) => createSplit(queryClient, args),
  })
}
