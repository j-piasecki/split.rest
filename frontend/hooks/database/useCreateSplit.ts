import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { auth } from '@utils/firebase'
import { makeRequest } from '@utils/makeApiRequest'
import { CreateSplitArguments, SplitInfo } from 'shared'

async function createSplit(queryClient: QueryClient, args: CreateSplitArguments) {
  const splitId = await makeRequest<CreateSplitArguments, number>('POST', 'createSplit', args)

  await queryClient.setQueryData(
    ['groupSplits', args.groupId],
    (oldData?: { pages: SplitInfo[][] }) => {
      if (!oldData) {
        return
      }

      return {
        ...oldData,
        pages: oldData.pages.map((page, index) =>
          index === 0
            ? [
                {
                  id: splitId,
                  version: 1,
                  createdById: auth.currentUser?.uid,
                  paidById: args.paidBy,
                  ...args,
                },
                ...page,
              ]
            : page
        ),
      }
    }
  )

  await queryClient.invalidateQueries({ queryKey: ['groupSplits', args.groupId] })
  await queryClient.invalidateQueries({ queryKey: ['groupMembers', args.groupId] })
  await queryClient.invalidateQueries({ queryKey: ['groupInfo', args.groupId] })
  await queryClient.invalidateQueries({ queryKey: ['splitHistory', args.groupId, splitId] })
}

export function useCreateSplit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: CreateSplitArguments) => createSplit(queryClient, args),
  })
}
