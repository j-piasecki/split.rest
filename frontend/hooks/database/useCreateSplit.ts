import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateSplitRelatedQueries } from '@utils/queryClient'
import { CreateSplitArguments } from 'shared'

export async function createSplit(args: CreateSplitArguments) {
  const splitId = await makeRequest<CreateSplitArguments, number>('POST', 'createSplit', args)

  await invalidateSplitRelatedQueries(args.groupId, splitId ?? -1)
}

export function useCreateSplit() {
  return useMutation({
    mutationFn: (args: CreateSplitArguments) => createSplit(args),
  })
}
